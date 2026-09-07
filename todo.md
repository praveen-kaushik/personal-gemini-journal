# Project TODO

## Completed

- [x] Full-stack Personal Gemini Journal website initialized.
- [x] Attached `personal-gemini-journal-source.zip` inspected and reconciled with the active project.
- [x] Cosmic desktop and mobile frontend reviewed.
- [x] Fixed Firestore routing so managed preview OAuth users do not use their OAuth identifier as a Firebase UID; Firestore is now selected only for verified Firebase bearer sessions.
- [x] Protected journal procedures derive identity from authenticated server context.
- [x] Firebase Web sign-in and Firebase Admin verification paths included.
- [x] Firestore user-scoped reads/writes and owner-only rules included.
- [x] Secret Manager-backed Gemini wrapper and fail-closed fallback included.
- [x] Security constitution and Firebase/GCP setup documentation included.
- [x] `pnpm check`, `pnpm test`, and `pnpm build` pass after the routing fix.
- [x] Source scan found no hardcoded Gemini or Google API key patterns.
- [x] Current preview screenshot renders the authenticated cosmic workspace without a new Firestore permission error after the routing fix.

## External validation still pending

- [ ] Replace the latest enabled Secret Manager payload with a valid Google AI Studio Gemini API key; the current live request returns `API_KEY_INVALID`.
- [ ] Exercise Firebase browser sign-in end-to-end with a protected journal request.
- [ ] Deploy `firestore.rules` and run Firebase Emulator Suite cross-user read/create/update/delete tests.

## Release

- [ ] Save a new checkpoint after the Firebase UID routing fix.
- [ ] Deliver the updated website version and validation summary.

## Post-sign-in state bug

- [x] Observe Firebase auth state in the React app with `onAuthStateChanged`.
- [x] Refresh tRPC auth/session state after Firebase sign-in and sign-out.
- [x] Ensure the journal workspace replaces the sign-in state after successful authentication.
- [x] Rerun typecheck, tests, build, and frontend verification after the auth observer and model updates; live browser sign-in remains external validation.

## Post-sign-in state bug

- [x] Observe Firebase auth state in the React app with `onAuthStateChanged`.
- [x] Integrate Google `signInWithPopup` into the existing Firebase helper.
- [x] Refresh tRPC auth/session state after Firebase sign-in and sign-out.
- [x] Ensure the journal workspace replaces the sign-in state after successful authentication.
- [x] Rerun typecheck, tests, build, and frontend verification after the auth observer and model updates; live browser sign-in remains external validation.

## Requested Gemini model change

- [x] Switch all server-side journal generation paths to `gemini-3.5-flash-lite`.
- [x] Verify no journal path still uses the previous model identifier.
- [x] Rerun typecheck, tests, build, and frontend verification after the model change.

## Model verification evidence

- [x] Direct Secret Manager-backed Gemini requests use `gemini-3.5-flash-lite`.
- [x] Managed server-side fallback explicitly requests `gemini-3.5-flash-lite`.
- [x] No previous Gemini model identifier remains in TypeScript source.
- [x] Fresh desktop and mobile frontend previews completed after the model change.
- [x] Final typecheck, tests, and production build pass after the fallback update.

## Final fix evidence

- [x] Page-level Firebase Google popup sign-in no longer forces a full-page reload.
- [x] Firebase `onAuthStateChanged` invalidates `trpc.auth.me`, allowing the protected journal workspace to replace the sign-in view in place.
- [x] Final `pnpm check`, `pnpm test`, and `pnpm build` pass after the auth-state and model changes.
- [x] Fresh desktop frontend preview reviewed after the post-sign-in fix.
- [ ] Live Firebase browser sign-in and protected-request flow still require a configured Firebase client session for end-to-end validation.
