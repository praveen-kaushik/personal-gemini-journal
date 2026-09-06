# Project TODO

## Completed deterministic work

- [x] Full-stack project initialized.
- [x] Google AI Studio security constitution documented in `SECURITY_CONSTITUTION.md`.
- [x] Threat model, secure coding, secret handling, prompt privacy, logging, abuse controls, and per-user isolation guidance included.
- [x] Firebase Web sign-in client added with Google provider support.
- [x] Server-only Firebase Admin adapter added for verified bearer-token authentication.
- [x] Protected journal procedures derive identity from the authenticated server context and reject unauthenticated access.
- [x] Multi-turn Gemini brainstorming and journaling flow added with private summaries.
- [x] Secret Manager-backed Gemini wrapper added with fail-closed fallback behavior when IAM or secret access is unavailable.
- [x] Firestore reads and writes added under `users/{uid}/...` when Firebase is configured; SQL remains the explicit preview fallback.
- [x] Private Constellation reflection flow added using only the active user’s history.
- [x] Firestore rules added with correct owner-only create, read, update, and delete checks.
- [x] Firebase, Firestore, and Secret Manager setup contract documented in `FIREBASE_SETUP.md`.
- [x] Cosmic responsive interface and provided `AIChatBox` integration added.
- [x] Unit tests cover unauthenticated access, server-owned identity, reflection preconditions, Firebase Admin connectivity, fail-closed Secret Manager behavior, and Firestore rule invariants.
- [x] Deterministic `pnpm check`, `pnpm test`, and `pnpm build` pass.
- [x] Source scan found no hardcoded Gemini or Google API key patterns.
- [x] Desktop and mobile authenticated workspace previews reviewed.

## Pending live production validation

- [ ] Exercise Firebase browser sign-in through ID-token attachment and a protected journal request end-to-end.
- [ ] Grant the configured runtime identity Secret Manager access and validate that the configured Gemini secret exists, is readable, and is consumed by the Gemini wrapper.
- [ ] Deploy `firestore.rules` to the user’s Firebase project and run emulator/integration tests for cross-user read/create/update/delete denial.
- [ ] Reclassify the project as production-ready only after the above live evidence exists.

## Honest acceptance notes

- [x] No Gemini credential is present in frontend code, source control, logs, or analytics payloads.
- [x] No fake journal content, reviews, ratings, or testimonials were seeded.
- [x] The app remains usable in managed preview through the secure server-side fallback when external IAM is incomplete.
- [x] External Firebase/GCP limitations are documented rather than claimed as complete.

## Release evidence

- [x] Security documentation included.
- [x] Firestore rules included.
- [x] Database migration generated and applied.
- [x] Deterministic tests, typecheck, build, source scan, and visual verification reviewed.
- [ ] Save a new checkpoint for this deterministic verification pass.

## Status

- [x] Deterministic implementation pass complete.
- [ ] Live production validation complete.
- [ ] Final production-ready delivery complete.
