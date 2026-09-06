import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

let client: SecretManagerServiceClient | null = null;
let cachedSecret: string | null | undefined;

function getClient() {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) return null;
  client ??= new SecretManagerServiceClient({ projectId: process.env.FIREBASE_PROJECT_ID, credentials: { client_email: process.env.FIREBASE_CLIENT_EMAIL, private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") } });
  return client;
}

export async function getGeminiApiKey() {
  if (cachedSecret !== undefined) return cachedSecret;
  const secretName = process.env.GOOGLE_CLOUD_SECRET_NAME;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const secrets = getClient();
  if (!secretName || !projectId || !secrets) { cachedSecret = null; return cachedSecret; }
  const name = secretName.startsWith("projects/") ? secretName : `projects/${projectId}/secrets/${secretName}/versions/latest`;
  try {
    const [version] = await secrets.accessSecretVersion({ name });
    cachedSecret = version.payload?.data?.toString() ?? null;
  } catch (error) {
    console.warn("[SecretManager] Gemini secret unavailable; using managed server-side model fallback.", error instanceof Error ? error.message : "unknown error");
    cachedSecret = null;
  }
  return cachedSecret;
}
