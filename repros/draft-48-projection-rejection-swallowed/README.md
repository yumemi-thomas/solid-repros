# draft-48 — async `createStore`/`createProjection` rejection swallowed on the server

When the async form of `createStore`/`createProjection`/`createOptimisticStore`
rejects during SSR, the server and client disagree. The **client** turns it into
a `StatusError` that reaches the nearest `<Errored>`. The **server (streaming)**
discards the error (`(_e) => markReady()`), falls through to the seed, and
streams + activates the fragment **as success** — fake prices, no error UI.
The draft also describes a `renderToString` crash half (a rejected internal
deferred surfacing as an unhandled rejection). That half is version/host
dependent and did **not** reproduce on beta.17 under vite-node — the verdict is
driven by the seed-as-success asymmetry, which always reproduces.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`). The repro
installs a `process.on('unhandledRejection')` handler so, if the crash half ever
surfaces, it is reported instead of silently killing the run.

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/48-projection-rejection-swallowed.md`.
