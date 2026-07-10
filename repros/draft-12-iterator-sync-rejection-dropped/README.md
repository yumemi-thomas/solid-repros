# draft-12 — async-iterator rejection delivered synchronously is silently dropped

In the async-iterator branch, a `PromiseLike` whose `next()` result rejects
**synchronously** (ORM/query-cursor style thenables) is dropped with no error
handling — the node stays pending forever and never reaches `Errored`. The
promise branch handles exactly this case; the iterator branch guards its
rejection handler behind `if (!isSync)`. Same hardening family as the fixed
[#2858](https://github.com/solidjs/solid/issues/2858), client-side branch.

Run `npm run dev` — the page runs the scenario automatically (waits up to
300 ms) and shows a green **PASS** (fixed) or red **FAIL — bug reproduced**
verdict.

Pinned to published `2.0.0-beta.16` (npm). Issue draft:
`issue-drafts/12-iterator-sync-rejection-dropped.md`.

<!-- StackBlitz: hard-refresh if you hit a stale import error. -->
