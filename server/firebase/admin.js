// Server-only Firebase Admin access. Credentials come from the environment and are never logged.
const state = globalThis.__probizFirebase || (globalThis.__probizFirebase = { app: null, db: null });

const APP_NAME = 'probiz';

function usingEmulators() {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST);
}

function projectId(env = process.env) {
  return (env.FIREBASE_PROJECT_ID || env.GCLOUD_PROJECT || '').trim();
}

// The only way to reach Firebase: the emulators with a demo- project, or a real project named twice
// (FIREBASE_PROJECT_ID and FIREBASE_CONFIRM_PROJECT), so a real project is never used by accident.
function firebaseTarget(env = process.env) {
  const id = projectId(env);
  if (env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_STORAGE_EMULATOR_HOST) {
    if (!id.startsWith('demo-')) throw new Error('Firebase emulators require a project ID starting with "demo-" (FIREBASE_PROJECT_ID or GCLOUD_PROJECT).');
    return { mode: 'emulator', projectId: id };
  }
  if (!id) throw new Error('No Firebase target: start the emulators, or set FIREBASE_PROJECT_ID and FIREBASE_CONFIRM_PROJECT for a real project.');
  if (id.startsWith('demo-')) throw new Error('A "demo-" Firebase project can only be used with the emulators.');
  if (String(env.FIREBASE_CONFIRM_PROJECT || '').trim() !== id) {
    throw new Error('Real Firebase project refused: set FIREBASE_CONFIRM_PROJECT to the same value as FIREBASE_PROJECT_ID to enable it.');
  }
  return { mode: 'real', projectId: id };
}

function getFirebaseApp() {
  if (state.app) return state.app;
  const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app');
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return (state.app = existing);

  const target = firebaseTarget();
  const id = target.projectId;
  const options = {
    projectId: id,
    storageBucket: (process.env.FIREBASE_STORAGE_BUCKET || '').trim() || (target.mode === 'emulator' ? `${id}.appspot.com` : undefined),
  };

  if (target.mode === 'emulator') {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_FIREBASE_EMULATORS !== '1') {
      throw new Error('Firebase emulators are refused when NODE_ENV=production (set ALLOW_FIREBASE_EMULATORS=1 for a local production build).');
    }
  } else {
    const { FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: privateKey } = process.env;
    // Application Default Credentials (managed identity on Google hosting, `gcloud auth application-default login`
    // locally) are preferred; a service-account key is only a fallback. Dashboards store key newlines as "\n".
    options.credential = clientEmail && privateKey
      ? cert({ projectId: id, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') })
      : applicationDefault();
  }

  state.app = initializeApp(options, APP_NAME);
  return state.app;
}

function getFirestoreDb() {
  if (state.db) return state.db;
  const { initializeFirestore } = require('firebase-admin/firestore');
  const db = initializeFirestore(getFirebaseApp());
  db.settings({ ignoreUndefinedProperties: true });
  state.db = db;
  return db;
}

function getStorageBucket() {
  const { getStorage } = require('firebase-admin/storage');
  if (firebaseTarget().mode === 'real' && !(process.env.FIREBASE_STORAGE_BUCKET || '').trim()) {
    throw new Error('FIREBASE_STORAGE_BUCKET must be set explicitly for a real Firebase project.');
  }
  return getStorage(getFirebaseApp()).bucket();
}

// For scripts: releases gRPC and HTTP handles so the process can exit on its own.
async function closeFirebase() {
  if (!state.app) return;
  const { deleteApp } = require('firebase-admin/app');
  const app = state.app;
  state.app = null;
  state.db = null;
  await deleteApp(app);
}

module.exports = { getFirebaseApp, getFirestoreDb, getStorageBucket, usingEmulators, firebaseTarget, closeFirebase };
