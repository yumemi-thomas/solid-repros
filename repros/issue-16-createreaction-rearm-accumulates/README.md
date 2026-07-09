# issue-16 — `createReaction` re-arm accumulates arms

`createReaction` should replace its tracked sources when you re-arm it before it
fires (1.x semantics). In Solid 2.0 each `track()` adds a *new* deferred arm
without disposing the superseded one, so the reaction fires more than once.

Run `npm run dev` and use the buttons:

1. **arm (track a, then b)** — arms on `a`, then re-arms on `b` before firing.
2. **bump a** — should stay `0` (the `a` arm was superseded by `track(b)`);
   2.0 shows `1`.
3. **bump b** — 1.x total `1`, 2.0 total `2`: both arms stayed live.

Pinned to published `2.0.0-beta.16` (npm). Issue draft:
`issue-drafts/16-createreaction-rearm-accumulates.md`.

<!-- StackBlitz: hard-refresh if you hit a stale import error. -->
