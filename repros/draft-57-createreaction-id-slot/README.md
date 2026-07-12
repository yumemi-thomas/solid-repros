# draft-57 — `createReaction` consumes a client hydration id slot the server never allocates

On the client, the tracking function returned by `createReaction` synchronously
creates an effect node that consumes one hydration child-id slot from the
surrounding owner. The server shim is a bare passthrough (`tracking => tracking()`)
that allocates nothing. A component that arms a reaction in its body (the
documented pattern) therefore shifts the hydration id of **every subsequent
sibling** by one: the async memo misses its serialized value, the `_hk` element
claims miss, and the whole server-rendered tree is left unclaimed while the
client renders into a detached duplicate. The neighboring server shims
(`createTrackedEffect`, `onSettled`) already allocate a parity slot;
`createReaction` was missed.

Open the StackBlitz **preview** — the verdict renders on the page. StackBlitz
serves the dev build, where the id drift trips the hydration guard
("Failed attempt to create new DOM elements during hydration" /
"Hydration completed with N unclaimed server-rendered node(s)"). That throw/warn
**is** the reproduction → FAIL.

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/57-createreaction-id-slot.md`.
