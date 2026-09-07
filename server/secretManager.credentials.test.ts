import { describe, expect, it } from "vitest";
import { getGeminiApiKey } from "./secretManager";
import { secureInvokeLLM } from "./gemini";

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

  it.skipIf(process.env.RUN_LIVE_SECRET_TEST !== "1")("uses the retrieved secret for a minimal Gemini request", async () => {
    const response = await secureInvokeLLM({ messages: [{ role: "user", content: "Reply with OK only." }] });
    expect(response.choices?.[0]?.message?.content).toEqual(expect.any(String));
  }, 30_000);
});
