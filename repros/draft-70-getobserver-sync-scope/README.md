# draft-70 — `getObserver()` diverges on the server (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). `getObserver()` — the documented
"subscribe only if tracked" escape hatch — behaves differently on the server in
three observable ways: it returns `null` inside sync memos (which is what the
compiler emits for every JSX expression), `untrack()` does not clear it (server
`untrack` is a passthrough), and where it is non-null the value is the internal
`ServerComputation` record, not the `Owner` the type promises. The client is
non-null in tracking scopes, `null` under `untrack`, and shaped as an `Owner`.

Run: `npm run repro` (terminal). Prints PASS/FAIL per facet plus the raw server
observer keys. On beta.17 three of four facets FAIL.

Issue draft: `issue-drafts/70-getobserver-sync-scope.md`
