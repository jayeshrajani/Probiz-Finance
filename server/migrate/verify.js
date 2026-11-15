// `verify` command and the relationship checks shared with the dry run.
const source = require('./source');
const { toTarget, uniqueRules, maskValue, docHash } = require('./transform');
const { loadFileMap } = require('./manifest');
const { planCollections } = require('./data');
const { withRetry } = require('./run');
const { LEAD_TYPES } = require('../admin/leads');

const LIST_LIMIT = 50;

// Readers with the same shape for both sides: rows(table, fields) -> [{ id, ...fields }], ids(table) -> Set.
const sourceReader = {
  async rows(table, fields) {
    const tables = new Set(await source.listTables());
    if (!tables.has(table)) return [];
    const out = new Map();
    for (const f of fields) {
      for (const r of await source.fieldValues(table, f)) {
        if (!out.has(r.id)) out.set(r.id, { id: r.id });
        out.get(r.id)[f] = r.value;
      }
    }
    return [...out.values()];
  },
  async ids(table) {
    return (new Set(await source.listTables())).has(table) ? source.allIds(table) : new Set();
  },
};

function targetReader(db, meter) {
  return {
    async rows(table, fields) {
      const snap = await withRetry(() => db.collection(table).select(...fields).get());
      meter.reads += Math.max(1, snap.size);
      return snap.docs.map((d) => ({ id: d.id, ...Object.fromEntries(fields.map((f) => [f, d.get(f)])) }));
    },
    async ids(table) {
      const snap = await withRetry(() => db.collection(table).select().get());
      meter.reads += Math.max(1, snap.size);
      return new Set(snap.docs.map((d) => d.id));
    },
  };
}

// Broken references as stable strings, e.g. "lead_event/<id>.leadId -> lead/<id>". Reported, never fixed.
async function referenceIssues(read) {
  const types = new Map(LEAD_TYPES.map((d) => [d.type, d.model.tableName]));
  const cache = new Map();
  const ids = async (t) => {
    if (!cache.has(t)) cache.set(t, await read.ids(t));
    return cache.get(t);
  };
  const issues = [];
  const leads = await read.rows('lead', ['type', 'refId', 'refIds', 'assignedTo']);
  const staff = new Set([...(await ids('employee')), ...(await ids('admin'))]);
  const referenced = new Map();
  for (const l of leads) {
    const table = types.get(l.type);
    if (!table) {
      issues.push(`lead/${l.id}.type -> unknown lead type`);
      continue;
    }
    const apps = await ids(table);
    for (const ref of new Set([l.refId, ...(Array.isArray(l.refIds) ? l.refIds : [])].filter((v) => v != null).map(String))) {
      if (!apps.has(ref)) issues.push(`lead/${l.id}.refId -> ${table}/${ref}`);
      if (!referenced.has(table)) referenced.set(table, new Set());
      referenced.get(table).add(ref);
    }
    if (l.assignedTo != null && !staff.has(String(l.assignedTo))) issues.push(`lead/${l.id}.assignedTo -> staff/${l.assignedTo}`);
  }
  const leadIds = new Set(leads.map((l) => l.id));
  for (const e of await read.rows('lead_event', ['leadId'])) {
    if (!leadIds.has(String(e.leadId))) issues.push(`lead_event/${e.id}.leadId -> lead/${e.leadId}`);
  }
  for (const m of await read.rows('lead_meta', ['type', 'leadId'])) {
    const table = types.get(m.type);
    if (!table || !(await ids(table)).has(String(m.leadId))) issues.push(`lead_meta/${m.id}.leadId -> ${table || 'unknown type'}/${m.leadId}`);
  }
  const withoutLead = {};
  for (const table of new Set(types.values())) {
    const missing = [...(await ids(table))].filter((id) => !referenced.get(table)?.has(id)).length;
    if (missing) withoutLead[table] = missing;
  }
  return { issues: issues.sort(), applicationsWithoutLead: withoutLead };
}

async function targetDuplicates(db, meter, Model) {
  const rules = uniqueRules(Model);
  if (!rules.length) return [];
  const fields = [...new Set([...rules.map((r) => r.field), 'deleteFlag'])];
  const docs = await targetReader(db, meter).rows(Model.tableName, fields);
  const out = [];
  for (const rule of rules) {
    const groups = new Map();
    for (const d of docs) {
      const raw = d[rule.field];
      if (raw == null || String(raw).trim() === '' || (rule.active && d.deleteFlag === true)) continue;
      const key = rule.ci ? String(raw).trim().toLowerCase() : String(raw).trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(d.id);
    }
    for (const [key, list] of groups) if (list.length > 1) out.push({ field: rule.field, value: maskValue(key), ids: list.sort() });
  }
  return out;
}

// Full ID comparison (reads every target ID). Extra target records are usually deletions the catch-up cannot copy;
// they are listed for a person to review and never removed by the tool.
function idDiff(sourceIds, targetIds) {
  const missing = [...sourceIds].filter((id) => !targetIds.has(id)).sort();
  const extra = [...targetIds].filter((id) => !sourceIds.has(id)).sort();
  return { missingInTarget: missing.length, extraInTarget: extra.length, missingIds: missing.slice(0, LIST_LIMIT), extraIds: extra.slice(0, LIST_LIMIT) };
}

async function runVerify(ctx, { sample = 50, compareIds = false } = {}) {
  const { selected, notes } = await planCollections(ctx.models, ctx.collections);
  const collections = {};
  const failures = [];
  const review = [];
  for (const table of selected) {
    const Model = ctx.models.get(table);
    const coll = ctx.db.collection(table);
    const sourceCount = await source.countRows(table);
    const agg = await withRetry(() => coll.count().get());
    const targetCount = agg.data().count;
    ctx.meter.reads += Math.max(1, Math.ceil(targetCount / 1000));

    const fileMap = await loadFileMap(ctx.db, table, ctx.meter);
    const rows = await source.readByIds(table, await source.sampleIds(table, sample));
    const items = rows.map((row) => toTarget(Model, row, fileMap)).filter((i) => !i.invalid);
    const snaps = items.length ? await withRetry(() => ctx.db.getAll(...items.map((i) => coll.doc(i.id)))) : [];
    ctx.meter.reads += items.length;
    const missing = [];
    const different = [];
    snaps.forEach((snap, k) => {
      if (!snap.exists) missing.push(items[k].id);
      else if (docHash(snap.data()) !== items[k].hash) different.push(items[k].id);
    });
    const duplicates = await targetDuplicates(ctx.db, ctx.meter, Model);
    const result = {
      sourceCount, targetCount,
      count: targetCount === sourceCount ? 'equal' : targetCount > sourceCount ? 'target has more (written after the copy?)' : 'TARGET HAS FEWER',
      sampled: items.length, sampleMissing: missing.slice(0, LIST_LIMIT), sampleDifferent: different.slice(0, LIST_LIMIT), duplicates,
    };
    collections[table] = result;
    if (compareIds) {
      result.ids = idDiff(await source.allIds(table), await targetReader(ctx.db, ctx.meter).ids(table));
      if (result.ids.missingInTarget) failures.push(`${table}: ${result.ids.missingInTarget} source record(s) missing in the target`);
      if (result.ids.extraInTarget) review.push(`${table}: ${result.ids.extraInTarget} target record(s) not in the source (deleted at the source?)`);
    }
    if (targetCount < sourceCount) failures.push(`${table}: target has fewer documents than the source`);
    if (missing.length || different.length) failures.push(`${table}: ${missing.length} sampled document(s) missing, ${different.length} different`);
    if (duplicates.length) failures.push(`${table}: duplicate unique values in the target`);
    ctx.log(`[verify] ${table}: source ${sourceCount}, target ${targetCount}, sample ${items.length} (missing ${missing.length}, different ${different.length})`);
  }

  const before = await referenceIssues(sourceReader);
  const after = await referenceIssues(targetReader(ctx.db, ctx.meter));
  const known = new Set(before.issues);
  const introduced = after.issues.filter((i) => !known.has(i));
  if (introduced.length) failures.push(`${introduced.length} broken reference(s) in the target that the source does not have`);

  const admins = await targetReader(ctx.db, ctx.meter).rows('admin', ['deleteFlag']);
  const activeAdmins = admins.filter((a) => a.deleteFlag !== true).length;
  if (!activeAdmins) failures.push('no active admin in the target (POST /api/createAdmin would accept an unauthenticated first admin)');

  return {
    notes,
    collections,
    references: {
      sourceIssues: before.issues.length,
      targetIssues: after.issues.length,
      introduced: introduced.slice(0, LIST_LIMIT),
      sourceIssueList: before.issues.slice(0, LIST_LIMIT),
      applicationsWithoutLead: after.applicationsWithoutLead,
    },
    activeAdmins,
    review,
    failures,
    ok: failures.length === 0,
  };
}

module.exports = { runVerify, referenceIssues, sourceReader, targetReader, idDiff };
