# draft-07-freeze-store-poison

2.0.0-beta.17: `Object.freeze(store)` permanently poisons the store (enumeration, reads and writes all throw afterward)

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/07-freeze-store-poison.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
