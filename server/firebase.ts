import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function firebaseApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export async function verifyFirebaseBearerToken(authorization?: string) {
  const app = firebaseApp();
  if (!app || !authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  try { return await getAuth(app).verifyIdToken(token, true); }
  catch { return null; }
}

export function firestore() {
  const app = firebaseApp();
  if (!app) return null;
  return getFirestore(app);
}

export function firebaseConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export async function verifyFirebaseConnection() {
  const app = firebaseApp();
  if (!app) return false;
  await getAuth(app).listUsers(1);
  return true;
}
