import { FieldValue } from "firebase-admin/firestore";
import { firebaseConfigured, firestore } from "./firebase";

function store() {
  return firebaseConfigured() ? firestore() : null;
}

function dateValue(value: any) { return value?.toDate?.() ?? value ?? new Date(); }

export async function listFirestoreConversations(uid: string | undefined) {
  const db = store();
  if (!db || !uid) return null;
  const snapshot = await db.collection(`users/${uid}/conversations`).orderBy("updatedAt", "desc").limit(50).get();
  return snapshot.docs.map(doc => { const data = doc.data(); return { id: Number(doc.id), userId: 0, title: String(data.title ?? "Untitled constellation"), summary: data.summary ? String(data.summary) : null, createdAt: dateValue(data.createdAt), updatedAt: dateValue(data.updatedAt) }; });
}

export async function getFirestoreConversation(uid: string | undefined, conversationId: number) {
  const db = store();
  if (!db || !uid) return null;
  const conversationDoc = await db.doc(`users/${uid}/conversations/${conversationId}`).get();
  if (!conversationDoc.exists) return { conversation: undefined, messages: [] };
  const data = conversationDoc.data() ?? {};
  const messageSnapshot = await db.collection(`users/${uid}/conversations/${conversationId}/messages`).orderBy("createdAt", "asc").limit(100).get();
  return { conversation: { id: conversationId, userId: 0, title: String(data.title ?? "Untitled constellation"), summary: data.summary ? String(data.summary) : null, createdAt: dateValue(data.createdAt), updatedAt: dateValue(data.updatedAt) }, messages: messageSnapshot.docs.map((doc, index) => { const item = doc.data(); return { id: index, conversationId, userId: 0, role: item.role as "user" | "assistant", content: String(item.content ?? ""), createdAt: dateValue(item.createdAt) }; }) };
}

export async function getFirestoreLatestInsight(uid: string | undefined) {
  const db = store();
  if (!db || !uid) return null;
  const snapshot = await db.collection(`users/${uid}/insights`).orderBy("createdAt", "desc").limit(1).get();
  const doc = snapshot.docs[0];
  if (!doc) return undefined;
  const data = doc.data();
  return { id: 0, userId: 0, themes: String(data.themes ?? ""), reflection: String(data.reflection ?? ""), followUpPrompt: String(data.followUpPrompt ?? ""), createdAt: dateValue(data.createdAt) };
}

export async function mirrorConversation(uid: string | undefined, id: number, title: string) {
  const db = store();
  if (!db || !uid) return;
  await db.doc(`users/${uid}/conversations/${id}`).set({ uid, title, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function mirrorMessage(uid: string | undefined, conversationId: number, role: "user" | "assistant", content: string) {
  const db = store();
  if (!db || !uid) return;
  await db.collection(`users/${uid}/conversations/${conversationId}/messages`).add({ uid, role, content, createdAt: FieldValue.serverTimestamp() });
  await db.doc(`users/${uid}/conversations/${conversationId}`).set({ uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function mirrorSummary(uid: string | undefined, conversationId: number, summary: string) {
  const db = store();
  if (!db || !uid) return;
  await db.doc(`users/${uid}/conversations/${conversationId}`).set({ uid, summary, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function mirrorInsight(uid: string | undefined, themes: string, reflection: string, followUpPrompt: string) {
  const db = store();
  if (!db || !uid) return;
  await db.collection(`users/${uid}/insights`).add({ uid, themes, reflection, followUpPrompt, createdAt: FieldValue.serverTimestamp() });
}
