# draft-46 — `createRevealOrder` is a server no-op (membership leak + no coordination)

Streaming SSR (Solid **2.0.0-beta.17**). `createRevealOrder` — the primitive
`<Reveal>` wraps — is a bare passthrough on the server. It sets no group context
and registers no composite slot, so (a) its `<Loading>` children enroll as
**direct** slots of the ancestor `<Reveal>` group (membership leak: a three-key
`$dfj` held to the slowest card), and (b) its own `order` option coordinates
nothing. A `<Reveal order="natural">` control scopes correctly.

Run: `npm run repro` (terminal). Streams REPRO 1 (leak), a CONTROL, and REPRO 2
(standalone `together`, uncoordinated); asserts on the emitted group key lists.
On beta.17 it prints FAIL (cards leaked; standalone did not coordinate).

Issue draft: `issue-drafts/46-createrevealorder-server-noop.md`
