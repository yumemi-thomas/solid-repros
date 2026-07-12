# draft-71 — server writable memo drops `lazy`, setter returns `undefined` (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). The writable-memo form
`createSignal(fn, { lazy: true })` diverges on the server: `lazy` is silently
dropped so the compute runs **eagerly at creation** (wasted SSR work — e.g. a
fetch — for a value never read this pass), and the setter returns `undefined`
instead of the written value. The client honors `lazy` (0 computes for a
never-read memo) and its setter returns the value it wrote.

Run: `npm run repro` (terminal). Prints PASS/FAIL for the compute count and the
setter return. On beta.17 both FAIL (server computes 1, setter returns undefined).

Issue draft: `issue-drafts/71-writable-memo-lazy-setter.md`
