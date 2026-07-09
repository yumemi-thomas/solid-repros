# issue-09 — boundary-id leak breaks root `lazy()` hydration

Streaming SSR: after a pending `<Loading>` boundary, the shared
`_currentBoundaryId` is never restored, so a later **root-level** `lazy()`'s
module registration lands in the boundary's asset map instead of the root
`_$HY.r["_assets"]` map. The root map is never emitted, so the root-level lazy
footer can never hydrate on the client. Common shape:
`<Suspense>route</Suspense><LazyFooter/>`.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

Pinned to published `2.0.0-beta.16` (npm); also reproduces on `2.0.0-beta.15`.
Issue draft: `issue-drafts/09-boundary-id-leak-lazy-hydration.md`.
