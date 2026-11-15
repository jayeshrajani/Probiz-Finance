// Usage: npm run check:firebase (starts the Firestore and Storage emulators, runs this check, stops them).
// Refuses to run against anything but the emulators with a demo- project.
const { randomUUID } = require('crypto');
const { getFirestoreDb, getStorageBucket, usingEmulators, closeFirebase } = require('../server/firebase/admin');

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures.push(name);
}
const denied = (status) => status === 401 || status === 403;

async function checkFirestore(project, id) {
  const { Timestamp } = require('firebase-admin/firestore');
  const db = getFirestoreDb();
  const ref = db.collection('emulator_check').doc(id);
  const created = new Date();

  await ref.create({ name: 'check', createdAt: Timestamp.fromDate(created), nested: { list: [1, 'two', null] }, skipped: undefined });
  const snap = await ref.get();
  check('Firestore write and read', snap.exists && snap.get('name') === 'check' && snap.get('createdAt').toDate().getTime() === created.getTime());
  check('Firestore drops undefined values', snap.exists && !('skipped' in snap.data()));

  const counted = await db.collection('emulator_check').where('name', '==', 'check').count().get();
  check('Firestore count() aggregation', counted.data().count >= 1, `count ${counted.data().count}`);

  await db.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    tx.update(ref, { counter: (current.get('counter') || 0) + 1 });
  });
  check('Firestore transaction', (await ref.get()).get('counter') === 1);

  // Requests without the Admin SDK's owner credential are evaluated against firestore.rules.
  const rest = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${project}/databases/(default)/documents/emulator_check/${id}`);
  check('Firestore rules deny unauthenticated clients', denied(rest.status), `HTTP ${rest.status}`);

  await ref.delete();
  check('Firestore delete', !(await ref.get()).exists);
}

async function checkStorage(id) {
  const bucket = getStorageBucket();
  const file = bucket.file(`private/check/${id}.txt`);
  const body = 'probiz emulator check';

  await file.save(Buffer.from(body), { contentType: 'text/plain', resumable: false });
  const [content] = await file.download();
  check('Storage upload and download', content.toString() === body);

  const objectUrl = `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;
  const anonymous = await fetch(objectUrl);
  check('Storage rules deny unauthenticated clients', denied(anonymous.status), `HTTP ${anonymous.status}`);

  // Decision D10 input: does a download-token URL bypass deny-all rules? Emulator behaviour only.
  const token = randomUUID();
  await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
  const withToken = await fetch(`${objectUrl}&token=${token}`);
  console.log(`INFO Storage download-token URL under deny-all rules: HTTP ${withToken.status} (emulator only, not proof for production)`);

  await file.delete();
  const [exists] = await file.exists();
  check('Storage delete', !exists);
}

async function main() {
  const project = (process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '').trim();
  if (!usingEmulators() || !process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST || !project.startsWith('demo-')) {
    throw new Error('Run this through `npm run check:firebase` (Firestore and Storage emulators with a demo- project only).');
  }
  console.log(`Project ${project}; Firestore ${process.env.FIRESTORE_EMULATOR_HOST}; Storage ${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`);
  const id = randomUUID();
  await checkFirestore(project, id);
  await checkStorage(id);
}

main()
  .catch((err) => {
    console.error(`FAIL ${err.message}`);
    failures.push('unexpected error');
  })
  .finally(async () => {
    await closeFirebase();
    console.log(failures.length ? `${failures.length} check(s) failed.` : 'All emulator checks passed.');
    // Exit naturally: process.exit() with open handles aborts Node on Windows.
    process.exitCode = failures.length ? 1 : 0;
  });
