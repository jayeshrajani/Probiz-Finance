// `data` command: copies every model table into the Firestore collection of the same name.
// Same IDs and timestamps; existing documents are never overwritten unless the source is newer and --update-older is set.
const source = require('./source');
const { toTarget, schemaErrors, uniqueRules, maskValue, docHash } = require('./transform');
const { loadFileMap } = require('./manifest');
const { withRetry } = require('./run');

const SKIPPED_TABLES = { rate_limits: 'short-lived rate-limit counters (not migrated by design)' };
const LIST_LIMIT = 50;

async function planCollections(models, only) {
  const tables = await source.listTables();
  const present = new Set(tables);
  const notes = { skippedTables: [], tablesWithoutModel: [], modelsWithoutTable: [] };
  let selected = [];
  for (const t of tables) {
    if (SKIPPED_TABLES[t]) notes.skippedTables.push({ table: t, reason: SKIPPED_TABLES[t] });
    else if (!models.has(t)) notes.tablesWithoutModel.push(t);
    else selected.push(t);
  }
  for (const t of models.keys()) if (!present.has(t)) notes.modelsWithoutTable.push(t);
  if (only) {
    const unknown = only.filter((t) => !models.has(t));
    if (unknown.length) throw new Error(`Unknown collection(s): ${unknown.join(', ')}`);
    selected = selected.filter((t) => only.includes(t));
  }
  return { selected, notes };
}

async function sourceDuplicates(Model) {
  const out = [];
  for (const rule of uniqueRules(Model)) {
    for (const d of await source.duplicateValues(Model.tableName, rule.field, rule)) {
      out.push({ field: rule.field, value: maskValue(d.key), ids: d.ids });
    }
  }
  return out;
}

const compareTs = (a, b) => (a.seconds - b.seconds) || (a.nanoseconds - b.nanoseconds);

function classify(item, snap) {
  item.snap = snap;
  if (!snap.exists) return 'missing';
  const target = snap.data();
  if (docHash(target) === item.hash) return 'unchanged';
  const targetUpdated = target.updatedAt;
  const sourceNewer = targetUpdated && typeof targetUpdated.seconds === 'number' ? compareTs(item.doc.updatedAt, targetUpdated) > 0 : false;
  return sourceNewer ? 'sourceNewer' : 'targetNewer';
}

const writesFor = (ctx, item) => (item.state === 'missing' || (item.state === 'sourceNewer' && ctx.updateOlder) ? 1 : 0);

async function createOne(ctx, coll, item) {
  try {
    await withRetry(() => coll.doc(item.id).create(item.doc));
    ctx.budget.used += 1;
    ctx.meter.writes += 1;
    item.state = 'created';
  } catch (err) {
    if (err?.code === 6) {
      // ALREADY_EXISTS: created meanwhile (or by an earlier attempt whose reply was lost); compare again.
      const snap = await coll.doc(item.id).get();
      ctx.meter.reads += 1;
      item.state = classify(item, snap);
    } else if (err?.code === 3) {
      item.state = 'invalid';
      item.invalid = 'rejected by Firestore (INVALID_ARGUMENT)';
    } else {
      throw err;
    }
  }
}

async function writeItems(ctx, coll, items) {
  const creates = items.filter((i) => i.state === 'missing');
  if (creates.length) {
    try {
      await withRetry(() => {
        const batch = ctx.db.batch();
        for (const i of creates) batch.create(coll.doc(i.id), i.doc);
        return batch.commit();
      });
      ctx.budget.used += creates.length;
      ctx.meter.writes += creates.length;
      for (const i of creates) i.state = 'created';
    } catch (err) {
      // A batch is all-or-nothing; find the document that failed one at a time.
      if (err?.code !== 6 && err?.code !== 3) throw err;
      for (const i of creates) await createOne(ctx, coll, i);
    }
  }
  if (!ctx.updateOlder) return;
  for (const i of items.filter((x) => x.state === 'sourceNewer')) {
    const ref = coll.doc(i.id);
    const replaced = await withRetry(() => ctx.db.runTransaction(async (t) => {
      const current = await t.get(ref);
      if (!current.exists || !current.updateTime.isEqual(i.snap.updateTime)) return false;
      t.set(ref, i.doc);
      return true;
    }));
    ctx.meter.reads += 1;
    if (replaced) {
      ctx.budget.used += 1;
      ctx.meter.writes += 1;
      i.state = 'updated';
    } else {
      i.state = 'targetNewer';
    }
  }
}

const newStats = () => ({
  sourceRows: 0, missing: 0, created: 0, unchanged: 0, updated: 0, sourceNewer: 0, targetNewer: 0, invalid: 0,
  nullsFilled: 0, lastActivityFilled: 0, filesMapped: 0, schemaWarnings: 0,
  conflicts: [], invalidRecords: [], schemaWarningSamples: [],
});

function tally(stats, item) {
  stats.sourceRows += 1;
  stats[item.state] += 1;
  stats.nullsFilled += item.nullsFilled;
  stats.filesMapped += item.filesMapped;
  if (item.lastActivityFilled) stats.lastActivityFilled += 1;
  if ((item.state === 'sourceNewer' || item.state === 'targetNewer') && stats.conflicts.length < LIST_LIMIT) {
    stats.conflicts.push({ id: item.id, newer: item.state === 'sourceNewer' ? 'source' : 'target' });
  }
  if (item.state === 'invalid' && stats.invalidRecords.length < LIST_LIMIT) stats.invalidRecords.push({ id: item.id, reason: item.invalid });
}

async function migrateCollection(ctx, Model) {
  const table = Model.tableName;
  const stats = newStats();
  stats.duplicates = await sourceDuplicates(Model);
  if (stats.duplicates.length) {
    stats.refused = 'duplicate unique values in the source; a person must resolve them first';
    ctx.log(`[data] ${table}: REFUSED (${stats.duplicates.length} duplicate value group(s))`);
    return stats;
  }
  const saved = ctx.checkpoint.get(table);
  if (ctx.resume && saved.done) {
    stats.skipped = 'completed in an earlier run (checkpoint)';
    return stats;
  }
  let after = ctx.resume ? saved.lastId : null;
  if (after) stats.resumed = true;
  const fileMap = await loadFileMap(ctx.db, table, ctx.meter);
  const coll = ctx.db.collection(table);

  for (;;) {
    const rows = await source.readPage(table, after, ctx.batchSize);
    if (!rows.length) break;
    const items = rows.map((row) => ({ row, ...toTarget(Model, row, fileMap) }));
    for (const i of items) if (i.invalid) i.state = 'invalid';
    const valid = items.filter((i) => !i.invalid);
    if (valid.length) {
      const snaps = await withRetry(() => ctx.db.getAll(...valid.map((i) => coll.doc(i.id))));
      ctx.meter.reads += valid.length;
      snaps.forEach((snap, k) => { valid[k].state = classify(valid[k], snap); });
    }

    let take = items.length;
    if (ctx.apply) {
      let need = 0;
      for (let k = 0; k < items.length; k += 1) {
        const w = writesFor(ctx, items[k]);
        if (need + w > ctx.budget.left) { take = k; break; }
        need += w;
      }
    }
    const batch = items.slice(0, take);
    if (ctx.apply) await writeItems(ctx, coll, batch);
    for (const i of batch) {
      tally(stats, i);
      const fields = schemaErrors(Model, i.row);
      if (fields.length) {
        stats.schemaWarnings += 1;
        if (stats.schemaWarningSamples.length < LIST_LIMIT) stats.schemaWarningSamples.push({ id: i.id, fields });
      }
    }
    if (batch.length) {
      after = batch[batch.length - 1].id;
      if (ctx.apply) ctx.checkpoint.set(table, { lastId: after, done: false });
    }
    ctx.log(`[data] ${table}: ${stats.sourceRows} rows | ${ctx.apply ? `created ${stats.created}, updated ${stats.updated}` : `to create ${stats.missing}`}, unchanged ${stats.unchanged}, conflicts ${stats.sourceNewer + stats.targetNewer}, invalid ${stats.invalid}`);
    if (take < items.length) {
      stats.stoppedAtBudget = true;
      return stats;
    }
  }
  if (ctx.apply) ctx.checkpoint.set(table, { lastId: after, done: true });
  return stats;
}

async function runData(ctx) {
  const { selected, notes } = await planCollections(ctx.models, ctx.collections);
  const resumed = ctx.apply && ctx.resume ? ctx.checkpoint.load() : false;
  const collections = {};
  let stoppedAt = null;
  for (const table of selected) {
    const stats = await migrateCollection(ctx, ctx.models.get(table));
    collections[table] = stats;
    if (stats.stoppedAtBudget) {
      stoppedAt = table;
      break;
    }
  }
  const sum = (k) => Object.values(collections).reduce((n, s) => n + (s[k] || 0), 0);
  const totals = Object.fromEntries(['sourceRows', 'missing', 'created', 'unchanged', 'updated', 'sourceNewer', 'targetNewer', 'invalid',
    'nullsFilled', 'lastActivityFilled', 'filesMapped', 'schemaWarnings'].map((k) => [k, sum(k)]));
  const refused = Object.entries(collections).filter(([, s]) => s.refused).map(([t]) => t);
  return {
    notes,
    checkpointResumed: resumed,
    collections,
    totals,
    refused,
    stoppedAtBudget: stoppedAt,
    notStarted: stoppedAt ? selected.slice(selected.indexOf(stoppedAt) + 1) : [],
    // Dry run: writes the apply run would need for new documents (and replacements with --update-older).
    writesNeeded: totals.missing + (ctx.updateOlder ? totals.sourceNewer : 0),
  };
}

module.exports = { runData, planCollections, SKIPPED_TABLES };
