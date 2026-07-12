# draft-52 — projection/derived-store commit uses `Object.assign`, not `reconcile` (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). When a `createProjection` /
`createStore(fn, seed)` / `createOptimisticStore(fn, seed)` compute **returns**
its next state, the client commits it through keyed `reconcile` (absent keys are
deleted, array length adjusts). The server commits with `Object.assign` — so the
seed's dropped keys survive as phantoms and a shortened array keeps a stale tail.

Run: `npm run repro` (terminal). Prints PASS/FAIL and the server-actual vs
client-expected shape for four derived-store forms. On beta.17 all four FAIL.

Issue draft: `issue-drafts/52-projection-assign-not-reconcile.md`
