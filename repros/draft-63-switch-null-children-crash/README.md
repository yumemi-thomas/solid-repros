# draft-63 — `<Switch>` with null/undefined resolved children crashes SSR

SSR/client asymmetry (Solid **2.0.0-beta.17**). When a `<Switch>`'s children
resolve to `null`/`undefined` (no `<Match>` arms — e.g. a guard component that
returns `null`), the server crashes with
`TypeError: Cannot read properties of null (reading 'when')`. It wraps the
non-array value as `[null]` then dereferences `null.when`.

The client runs `children().toArray()`, which maps nullish to `[]`, so the match
loop never runs and the `fallback` renders. The exact tree that shows the
fallback in the browser takes the whole SSR request down.

Run: `npm run repro` (terminal). A control `<Switch>` with a real `<Match>`
renders fine; the null-children case crashes. On beta.17 it FAILs.

Issue draft: `issue-drafts/63-switch-null-children-crash.md`
