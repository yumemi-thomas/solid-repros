# draft-45 — `natural` reveal group holds a nested composite until FULL resolution (SSR)

Streaming SSR/client asymmetry (Solid **2.0.0-beta.17**). In a three-level
`together > natural > (natural composite)` tree, the middle `natural` group
counts its nested composite child as ready only when the composite is **fully**
resolved on the server, but on **minimal** readiness on the client. So the outer
`together` is held until the slowest grandchild resolves (~120ms) on the server,
while the client releases it as soon as each direct slot is minimally ready
(~30ms). Design question: which readiness contract is intended? Docs, client,
and server currently disagree three ways.

Run: `npm run repro` (terminal). Streams the tree, prints template-arrival vs
`$dfj`-activation timing, and asserts the activation precedes the slow template.
On beta.17 it prints FAIL (activation held to the slow grandchild).

Issue draft: `issue-drafts/45-reveal-natural-composite-readiness.md`
