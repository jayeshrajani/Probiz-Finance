// Run state shared by the migration commands: reports, checkpoints, write budget and retries.
const fs = require('fs');
const path = require('path');
const { sha256 } = require('./transform');

const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  // Windows can briefly lock the target (antivirus, indexer): retry the atomic rename, then fall back to a copy.
  for (let attempt = 1; ; attempt += 1) {
    try {
      fs.renameSync(tmp, file);
      return file;
    } catch (err) {
      if (!['EPERM', 'EACCES', 'EBUSY'].includes(err.code)) throw err;
      if (attempt >= 5) {
        fs.copyFileSync(tmp, file);
        fs.rmSync(tmp, { force: true });
        return file;
      }
      pause(50 * attempt);
    }
  }
}

const writeReport = (dir, name, data) => writeJson(path.join(dir, `${stamp()}-${name}.json`), data);

// Per-collection progress of `data --apply`, tied to one source folder and one target project.
class Checkpoint {
  constructor(dir, source, project) {
    this.fingerprint = sha256(`${String(source).toLowerCase()}\n${project}`).slice(0, 16);
    this.file = path.join(dir, `checkpoint-${this.fingerprint}.json`);
    this.collections = {};
  }

  load() {
    if (!fs.existsSync(this.file)) return false;
    const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    if (saved.fingerprint !== this.fingerprint) return false;
    this.collections = saved.collections || {};
    return true;
  }

  get(collection) {
    return this.collections[collection] || { lastId: null, done: false };
  }

  set(collection, value) {
    this.collections[collection] = { ...this.get(collection), ...value, at: new Date().toISOString() };
    writeJson(this.file, { fingerprint: this.fingerprint, collections: this.collections });
  }
}

class WriteBudget {
  constructor(max) {
    this.max = max;
    this.used = 0;
  }

  get left() {
    return Math.max(0, this.max - this.used);
  }
}

// gRPC codes worth retrying: DEADLINE_EXCEEDED, RESOURCE_EXHAUSTED, ABORTED, INTERNAL, UNAVAILABLE.
const TRANSIENT = new Set([4, 8, 10, 13, 14]);

async function withRetry(fn, attempts = 5) {
  for (let i = 1; ; i += 1) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts || !TRANSIENT.has(err?.code)) throw err;
      await new Promise((r) => setTimeout(r, 200 * 2 ** i));
    }
  }
}

// Runs fn over items with at most `limit` in flight.
async function pool(items, limit, fn) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

module.exports = { writeReport, writeJson, Checkpoint, WriteBudget, withRetry, pool };
