import { describe, expect, it } from "vitest";
import { firebaseConfigured, verifyFirebaseConnection } from "./firebase";

describe("Firebase server credentials", () => {
  it("are configured and can reach the Firebase Auth API", async () => {
    expect(firebaseConfigured()).toBe(true);
    const result = await verifyFirebaseConnection();
    expect(result).toBe(true);
  }, 20_000);
});
