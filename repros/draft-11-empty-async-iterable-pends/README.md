# draft-11 — empty async iterable leaves the `Loading` boundary pending forever

A memo whose body returns an async iterable that completes (`{done:true}`)
**asynchronously** without ever yielding never settles its `Loading` boundary —
the fallback shows forever. The sync-completion path six lines away correctly
commits `undefined`, so "no results" from a streaming API is indistinguishable
from a hung request.

Run `npm run dev` — the page runs the scenario automatically (waits up to
300 ms) and shows a green **PASS** (fixed) or red **FAIL — bug reproduced**
verdict.

Pinned to published `2.0.0-beta.16` (npm). Issue draft:
`issue-drafts/11-empty-async-iterable-pends.md`.

<!-- StackBlitz: hard-refresh if you hit a stale import error. -->
