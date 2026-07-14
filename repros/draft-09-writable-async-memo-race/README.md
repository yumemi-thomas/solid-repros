# draft-09-writable-async-memo-race

2.0.0-beta.17: writable async memo silently swallows a manual `set()` while a fetch is in flight

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/09-writable-async-memo-race.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
