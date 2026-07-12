# draft-69 — server `action(fn)` returns the raw generator; body never runs (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). The server build returns the
generator function unwrapped, so calling the "action" yields a `Generator` (tag
`"Generator"`, no `.then`) and the body never runs. The client returns a
promise-driving wrapper. In isomorphic code `await save(...)` on the server
resolves immediately to the inert Generator and reads as success while nothing
ran.

Run: `npm run repro` (terminal). Prints `typeof result.then`, the toStringTag,
and whether the body executed, then PASS/FAIL. On beta.17 it FAILs.

Issue draft: `issue-drafts/69-action-returns-generator.md`
