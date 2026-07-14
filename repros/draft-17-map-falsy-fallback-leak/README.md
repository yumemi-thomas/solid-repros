# draft-17-map-falsy-fallback-leak

2.0.0-beta.17: `mapArray`/`repeat` recreates a falsy fallback on every empty update and leaks its owner

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/17-map-falsy-fallback-leak.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
