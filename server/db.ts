import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, journalConversations, journalInsights, journalMessages, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getFirestoreConversation, getFirestoreLatestInsight, listFirestoreConversations, mirrorConversation, mirrorInsight, mirrorMessage, mirrorSummary } from "./firestoreJournal";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) { values.role = user.role ?? "admin"; updateSet.role = values.role; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listConversations(userId: number, firebaseUid?: string) {
  const firestoreRows = await listFirestoreConversations(firebaseUid);
  if (firestoreRows) return firestoreRows;
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalConversations).where(eq(journalConversations.userId, userId)).orderBy(desc(journalConversations.updatedAt));
}

export async function getConversation(userId: number, conversationId: number, firebaseUid?: string) {
  const firestoreRow = await getFirestoreConversation(firebaseUid, conversationId);
  if (firestoreRow) return firestoreRow;
  const db = await getDb();
  if (!db) return { conversation: undefined, messages: [] };
  const conversation = (await db.select().from(journalConversations).where(and(eq(journalConversations.id, conversationId), eq(journalConversations.userId, userId))).limit(1))[0];
  if (!conversation) return { conversation: undefined, messages: [] };
  const messages = await db.select().from(journalMessages).where(and(eq(journalMessages.conversationId, conversationId), eq(journalMessages.userId, userId))).orderBy(journalMessages.createdAt);
  return { conversation, messages };
}

export async function createConversation(userId: number, title: string, firebaseUid?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(journalConversations).values({ userId, title }).$returningId();
  const id = result[0]?.id;
  if (id) await mirrorConversation(firebaseUid, id, title);
  return id;
}

export async function addMessage(userId: number, conversationId: number, role: "user" | "assistant", content: string, firebaseUid?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const owned = await db.select({ id: journalConversations.id }).from(journalConversations).where(and(eq(journalConversations.id, conversationId), eq(journalConversations.userId, userId))).limit(1);
  if (!owned[0]) throw new Error("Conversation not found");
  await db.insert(journalMessages).values({ userId, conversationId, role, content });
  await mirrorMessage(firebaseUid, conversationId, role, content);
}

export async function saveSummary(userId: number, conversationId: number, summary: string, firebaseUid?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(journalConversations).set({ summary }).where(and(eq(journalConversations.id, conversationId), eq(journalConversations.userId, userId)));
  await mirrorSummary(firebaseUid, conversationId, summary);
}

export async function saveInsight(userId: number, themes: string, reflection: string, followUpPrompt: string, firebaseUid?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(journalInsights).values({ userId, themes, reflection, followUpPrompt });
  await mirrorInsight(firebaseUid, themes, reflection, followUpPrompt);
}

export async function latestInsight(userId: number, firebaseUid?: string) {
  const firestoreRow = await getFirestoreLatestInsight(firebaseUid);
  if (firestoreRow) return firestoreRow;
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(journalInsights).where(eq(journalInsights.userId, userId)).orderBy(desc(journalInsights.createdAt)).limit(1))[0];
}
