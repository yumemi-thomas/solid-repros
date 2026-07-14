# draft-34-empty-string-projection-key

2.0.0-beta.17: `createProjection(..., { key: "" })` ignores the requested key and reconciles by `id`

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/34-empty-string-projection-key.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
