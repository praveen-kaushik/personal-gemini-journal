import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function firebaseReady() {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function auth() {
  if (!firebaseReady()) throw new Error("Firebase sign-in is not configured for this environment.");
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
}

export async function signInWithFirebase() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth(), provider);
}

export function subscribeFirebaseAuth(listener: (user: User | null) => void) {
  if (!firebaseReady()) return () => {};
  return onAuthStateChanged(auth(), listener);
}

export async function firebaseIdToken(): Promise<string | null> {
  if (!firebaseReady()) return null;
  const current: User | null = auth().currentUser;
  return current ? current.getIdToken() : null;
}

export async function signOutFirebase() {
  if (firebaseReady()) await signOut(auth());
}
