import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { verifyFirebaseBearerToken } from "../firebase";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  firebaseUid?: string;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  let firebaseUid: string | undefined;
  const firebaseToken = await verifyFirebaseBearerToken(opts.req.headers.authorization);
  if (firebaseToken) {
    const openId = firebaseToken.uid;
    firebaseUid = openId;
    await upsertUser({ openId, name: firebaseToken.name ?? null, email: firebaseToken.email ?? null, loginMethod: "firebase" });
    user = (await getUserByOpenId(openId)) ?? null;
  }
  if (!user) {
    try { user = await sdk.authenticateRequest(opts.req); }
    catch { user = null; }
  }
  return { req: opts.req, res: opts.res, user, firebaseUid };
}
