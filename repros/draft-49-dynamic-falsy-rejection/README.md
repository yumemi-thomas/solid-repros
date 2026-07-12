# draft-49 — server `dynamic()` swallows falsy promise rejections (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). The server `dynamic()` stores a
rejection as `error = err` and replays it with `if (error) throw error`. A
**falsy** rejection reason (`undefined`, `null`, `0`, `""`) passes the truthiness
check and is treated as success with an undefined component: the `<Loading>`
fragment serializes as resolved-success with an empty slot, no error crosses the
wire, and hydration never reaches `<Errored>`. Same class as #2857 (fixed in
`lazy()`, missed in `dynamic()`). Pure CSR routes the same rejection to `<Errored>`.

Run: `npm run repro` (terminal). A control rejects with a real Error (signaled
correctly); the repro rejects with `undefined`. On beta.17 it prints FAIL.

Issue draft: `issue-drafts/49-dynamic-falsy-rejection.md`
