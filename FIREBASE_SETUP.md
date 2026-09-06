# Firebase and Google Cloud production setup

The Personal Gemini Journal now supports a Firebase-backed production path while retaining the managed OAuth/SQL fallback used by the preview when Firebase is not configured. When the Firebase variables are present, the browser signs in with Firebase, tRPC requests carry the Firebase ID token, the server verifies that token with Firebase Admin, journal reads use Firestore, journal writes mirror to Firestore, and Gemini requests retrieve their credential from Secret Manager on the server.

| Surface | Required setup | Implemented security boundary |
|---|---|---|
| Firebase Auth | Enable Google sign-in or email link sign-in and add the production origin to authorized domains. | The browser receives only a Firebase ID token; the server verifies its signature and issuer before allowing journal operations. |
| Cloud Firestore | Deploy `firestore.rules` and keep user data under `users/{uid}/...`. | Rules require `request.auth.uid == uid`; reads and writes are selected by the verified Firebase UID. |
| Secret Manager | Create a secret such as `gemini-api-key` and grant access only to the server runtime service account. | The server resolves `GOOGLE_CLOUD_SECRET_NAME` through Secret Manager. The Gemini credential never enters `VITE_*` variables, React code, source control, analytics, or user-facing errors. |
| Server configuration | Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `GOOGLE_CLOUD_SECRET_NAME` through managed secrets. | Values are injected at runtime and are not committed to `.env` files. |
| Browser configuration | Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID`. | These initialize Firebase Auth only; they are not Gemini credentials. |

## Authentication contract

The client uses Firebase Google sign-in when the `VITE_FIREBASE_*` values are configured. The tRPC client attaches the current Firebase ID token to requests. The server verifies that token with Firebase Admin and maps the verified UID to the application user record. If Firebase is not configured, the managed preview OAuth session remains available so the interface can still be reviewed without fabricating credentials.

## Firestore path contract

Production reads and writes use paths such as `users/{uid}/conversations/{conversationId}`, `users/{uid}/conversations/{conversationId}/messages/{messageId}`, and `users/{uid}/insights/{insightId}`. Every helper receives the verified UID from request context rather than a client-supplied owner identifier. The included rules separately validate create, update, and delete operations so deletes never reference the absent `request.resource` object.

## Secret Manager and Gemini contract

`server/secretManager.ts` reads the configured secret with the server service account and keeps the value in a short-lived process-local cache. `server/gemini.ts` uses that value only in the server-side request to the Gemini API. If Secret Manager is not available in the managed preview, the app falls back to the built-in server-side model helper; no credential is exposed to the browser. Production deployments should grant the runtime service account only the `Secret Manager Secret Accessor` permission for the named secret.

## Validation checklist

Run `pnpm check`, `pnpm test`, and `pnpm build` before release. The Firebase credential test calls the Firebase Auth API with the configured Admin credentials. Deploy `firestore.rules` with the Firebase Emulator Suite and exercise cross-user read, create, update, delete, and reflection cases before production. Do not log prompts, journal text, tokens, credentials, or raw Gemini responses.
