# draft-10 — `Errored` fallback receives the internal `StatusError` wrapper for falsy rejections

When an async source rejects with a falsy value (`Promise.reject()`,
`reject(null)`), the `Errored`/`createErrorBoundary` fallback should receive the
original rejection value. Instead it receives the framework's internal
`StatusError` wrapper (with a leaked `.source` reactive node): the unwrap at
`boundaries.ts` uses `?.cause ?? error`, so a nullish `cause` falls back to the
wrapper itself.

Residual gap of the identity contract pinned by
[#2840](https://github.com/solidjs/solid/issues/2840) (truthy errors unwrap
correctly; falsy ones leak the wrapper).

Run `npm run dev` — the page runs the scenario automatically and shows a green
**PASS** (fixed) or red **FAIL — bug reproduced** verdict.

Pinned to published `2.0.0-beta.16` (npm). Issue draft:
`issue-drafts/10-errored-falsy-rejection-wrapper.md`.

<!-- StackBlitz: hard-refresh if you hit a stale import error. -->
