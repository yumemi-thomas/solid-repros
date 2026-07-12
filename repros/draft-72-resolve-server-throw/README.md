# draft-72 — `resolve()` throws on the server (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). `resolve(fn)` — the documented
way to await the first settled value of a reactive expression — has a real client
implementation but throws synchronously on the server:
`resolve is not implemented on the server`. Shared isomorphic data helpers using
it crash SSR only. The types compound it: every export condition resolves the
same client `.d.ts` (`resolve<T>(fn) => Promise<T>`), so TypeScript gives no
compile-time warning — the runtime crash is the first signal.

Run: `npm run repro` (terminal). Wraps `resolve()` in try/catch and reports the
throw as the reproduction. On beta.17 it prints FAIL.

Issue draft: `issue-drafts/72-resolve-server-throw.md`
