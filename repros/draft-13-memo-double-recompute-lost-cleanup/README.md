# draft-13-memo-double-recompute-lost-cleanup

2.0.0-beta.17: a memo recomputed twice in one flush loses the first run's cleanups and leaks child owners

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/13-memo-double-recompute-lost-cleanup.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
