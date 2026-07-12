# draft-44 — empty/all-sync nested `<Reveal>` deadlocks the outer `together` group

In streaming SSR, nesting a `<Reveal>` whose children register no async
fragments under a `<Reveal order="together">` permanently deadlocks the outer
group: the nested Reveal reports "fully resolved" but never "minimally
resolved", so the group's `$dfj` activation script is **never emitted**. The
article content streams into an inert `<template>` and the skeleton stays
forever. The client reveals the same tree normally at ~30ms.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

- CONTROL (static footer, no nested Reveal): activation emitted → PASS
- REPRO A (footer wrapped in `<Reveal order="natural">`): no activation → FAIL
- REPRO B (nested Reveal with a sync-resolving `<Loading>`): no activation → FAIL

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/44-reveal-empty-composite-deadlock.md`.
