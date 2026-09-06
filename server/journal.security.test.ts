import { describe, expect, it, vi } from "vitest";

vi.mock("./firestoreJournal", async () => {
  const actual = await vi.importActual<typeof import("./firestoreJournal")>("./firestoreJournal");
  return { ...actual, listFirestoreConversations: async () => null, getFirestoreConversation: async () => null, getFirestoreLatestInsight: async () => null };
});

import { readFileSync } from "node:fs";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function authenticatedContext(): TrpcContext {
  const now = new Date();
  return { user: { id: 999999, openId: "firebase-test-user", name: "Test Explorer", email: "test@example.com", loginMethod: "firebase", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("journal authorization boundaries", () => {
  it("rejects conversation reads without an authenticated session", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.journal.conversations()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps journal identity server-owned", () => {
    const source = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/journal.*userId.*input/i);
    expect(source).toContain("ctx.user");
  });

  it("keeps reflection private until the current user has enough history", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.journal.reflect()).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("requires path ownership for Firestore updates and deletes", () => {
    const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
    expect(rules).toContain("request.auth.uid == uid");
    expect(rules).toContain("resource.data.uid == uid");
    expect(rules).toContain("allow delete: if isOwner(uid) && resource.data.uid == uid;");
    expect(rules).not.toContain("allow delete: if isOwner(uid) && request.resource.data.uid == uid;");
  });
});
