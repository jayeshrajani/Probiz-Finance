// Server-only Firebase Admin access. Credentials come from the environment and are never logged.
const state = globalThis.__probizFirebase || (globalThis.__probizFirebase = { app: null, db: null });

const APP_NAME = 'probiz';

function usingEmulators() {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST);
}

function projectId() {
  return (process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || '').trim();
}

function getFirebaseApp() {
  if (state.app) return state.app;
  const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app');
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return (state.app = existing);

  const id = projectId();
  const isDemo = id.startsWith('demo-');
  const options = {
    projectId: id || undefined,
    storageBucket: (process.env.FIREBASE_STORAGE_BUCKET || '').trim() || (usingEmulators() ? `${id}.appspot.com` : undefined),
  };

  if (usingEmulators()) {
    if (!isDemo) throw new Error('Firebase emulators require a project ID starting with "demo-" (FIREBASE_PROJECT_ID or GCLOUD_PROJECT).');
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_FIREBASE_EMULATORS !== '1') {
      throw new Error('Firebase emulators are refused when NODE_ENV=production (set ALLOW_FIREBASE_EMULATORS=1 for a local production build).');
    }
  } else {
    if (isDemo) throw new Error('A "demo-" Firebase project can only be used with the emulators.');
    const { FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: privateKey } = process.env;
    // Hosting dashboards store the key's newlines as literal "\n".
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

module.exports = { getFirebaseApp, getFirestoreDb, getStorageBucket, usingEmulators, closeFirebase };
