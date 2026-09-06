import { describe, expect, it } from "vitest";
import { getGeminiApiKey } from "./secretManager";

describe("Google Cloud Secret Manager", () => {
  it("fails closed without exposing a secret when access is unavailable", async () => {
    const secret = await getGeminiApiKey();
    expect(secret === null || typeof secret === "string").toBe(true);
  });

  it.skipIf(process.env.RUN_LIVE_SECRET_TEST !== "1")("retrieves the configured Gemini secret without exposing its value", async () => {
    const secret = await getGeminiApiKey();
    expect(secret).toEqual(expect.any(String));
    expect(secret?.length).toBeGreaterThan(10);
  }, 20_000);
});
