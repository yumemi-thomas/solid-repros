# draft-02-dispose-wipes-preexisting-content

`render()` into a non-empty container appends, but its disposer wipes the whole container (1.x and 2.0.0-beta.17)

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/02-dispose-wipes-preexisting-content.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
