# draft-73 — `createUniqueId()` outside a reactive context throws on the server (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). `createUniqueId()` called outside
a reactive context (module scope, event handlers, non-component utilities) throws
on the server — `createUniqueId cannot be used outside of a reactive context` —
while the client falls back to a counter id (`cl-0`, `cl-1`, …). Shared libraries
that mint ids at module scope work in the browser and crash SSR (at import time
if top-level). 1x check: 1.x server also threw here, so this is a long-standing
asymmetry, not a 2.0 regression.

Run: `npm run repro` (terminal). Wraps the call in try/catch and reports the throw
as the reproduction. On beta.17 it prints FAIL.

Issue draft: `issue-drafts/73-createuniqueid-outside-context.md`
