# draft-01 (TanStack Start) — nested `<Loading>` enrolled in ancestor `<Reveal>` group

Same bug as `issue-17-ssr-reveal-nested-loading`, reproduced in a **real
TanStack Start app on Solid 2.0 beta** (official beta support, April 2026) to
confirm meta-framework impact.

A product page streams under `<Reveal order="together">`: product (300ms) and
reviews (800ms) are direct slots that should reveal together at ~800ms. A
recommendations panel (2500ms) is a **nested** `<Loading>` with its own
fallback inside the product slot. The server enrolls the nested boundary into
the ancestor group (3-key `$dfj`), so the whole page sits on skeletons until
~2500ms — a slow descendant a route author may not even own holds the entire
reveal hostage.

`npm start` (StackBlitz runs it automatically) boots the dev server, streams
`/control` (no nested boundary → PASS, 2-key group, releases at ~800ms) and `/`
(nested boundary → FAIL, 3-key group, held to ~2500ms), prints the verdict in
the **terminal**, then leaves the server running — open `/` in the preview to
watch the skeletons hang.

**SPA-nav vs hard-refresh A/B (visible in the preview):** navigate
`/control` → `/` client-side and the page behaves correctly — product +
reviews reveal together at ~800ms (client `Reveal` severs the scope at each
boundary) while recommendations trails independently at ~2.5s on its own
fallback. Hard-refresh `/` and the server enrolls the nested boundary into the
group: skeletons everywhere until ~2.5s, then everything at once. The same app
disagreeing with itself between CSR and SSR is the bug.

Versions: `@tanstack/solid-start@2.0.0-beta.24`, `@tanstack/solid-router@2.0.0-beta.23`,
`solid-js@2.0.0-beta.17`, `@solidjs/web@2.0.0-beta.17`, `vite-plugin-solid@3.0.0-next.7`.

Issue draft: `issue-drafts/01-reveal-nested-loading-grouping.md` (fix spans
solid `fix/reveal-nested-boundary-scope` + dom-expressions
`fix/df-deferred-swap-queue`).
