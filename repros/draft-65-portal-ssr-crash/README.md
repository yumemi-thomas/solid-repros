# draft-65 — `<Portal>` hard-crashes SSR (1.x rendered it as a silent no-op)

The **server** implementation of `<Portal>` is a hard
`throw new Error("Portal is not supported on the server")`; the **client** has a
full implementation. Solid 1.x rendered `<Portal>` on the server as a silent no-op
(`return ""`), so any migrated SSR app with a modal / toast / tooltip goes from
"works, mounts after hydration" to "the whole `renderToString` request crashes".
Worse: an `<Errored>` boundary above the portal bakes the error fallback into the
streamed HTML — users get an error page for a tree the client renders fine.

Run `npm run repro`. On `2.0.0-beta.17` it prints **FAIL — bug reproduced**: the
throw is the reproduction (the no-Portal control renders fine), and the `<Errored>`
variant shows the error baked into the served HTML. Expected: SSR renders the tree
without the portal content, which mounts client-side after hydration.

This is a 2.0 regression. Solid `2.0.0-beta.17`. Issue draft:
`issue-drafts/65-portal-ssr-crash.md`.
