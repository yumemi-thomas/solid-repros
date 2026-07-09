# issue-08 — `lazy()` in `<NoHydration>` renders nothing

`lazy()` inside `<NoHydration>` silently renders **nothing** during SSR. The
moduleUrl/manifest requirements are correctly waived for no-hydrate zones, but
the server `lazy()` wrapper bails out *before* creating the render memo, so the
resolved content is dropped — leaving an empty hole. The stream still completes
"successfully".

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

Pinned to published `2.0.0-beta.16` (npm); also reproduces on `2.0.0-beta.15`.
Issue draft: `issue-drafts/08-nohydration-lazy-renders-nothing.md`.
