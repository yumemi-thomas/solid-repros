# issue-07 — SSR crashes on non-Promise thenables

An async `createMemo` returning a **non-Promise thenable** (a PromiseLike — the
shape of a knex/mongoose query builder) crashes SSR with a `TypeError`. The
client awaits any Promises/A+ object, but the server only checks
`result instanceof Promise`, stores the thenable as a sync value, and then
dereferences `undefined` deep in the node resolver.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

Pinned to published `2.0.0-beta.16` (npm); also reproduces on `2.0.0-beta.15`.
Issue draft: `issue-drafts/07-ssr-thenable-crash.md`.
