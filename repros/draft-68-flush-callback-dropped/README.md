# draft-68 — server `flush(fn)` silently drops the callback (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). The server build of `flush()` is
a zero-arg no-op, so the `flush(fn)` overload never invokes `fn` and returns
`undefined`. The client runs the callback in a sync-flush scope and returns its
result. Isomorphic setup done inside `flush(() => …)` just silently skips during
SSR — no error, no warning.

Run: `npm run repro` (terminal). Prints whether the callback ran + its return,
then PASS/FAIL. On beta.17 it FAILs (`ran=false`, `returned=undefined`).

Issue draft: `issue-drafts/68-flush-callback-dropped.md`
