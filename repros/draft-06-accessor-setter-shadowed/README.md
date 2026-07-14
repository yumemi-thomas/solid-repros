# draft-06-accessor-setter-shadowed

2.0.0-beta.17: writing through an own accessor (get/set pair) never invokes the setter and kills the getter

This standalone browser reproduction mirrors the reviewed example in
`issue-drafts/06-accessor-setter-shadowed.md`. Open the preview and follow the on-screen action;
the result is reported as an explicit PASS/FAIL verdict.

Pinned to `solid-js@2.0.0-beta.17` and `@solidjs/web@2.0.0-beta.17`.
