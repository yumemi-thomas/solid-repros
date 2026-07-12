# draft-53 — store setter return-form (`setState(s => next)`) is a silent no-op on the server

The store setter's documented return-form — the callback returns the next value
instead of mutating the draft — does nothing on the **server**. The server setter
is `(fn) => fn(state)`: the return value is discarded, so the store is unchanged.
The **client** honors the return (arrays replaced index-wise, objects shallow-diffed
with missing keys deleted). Isomorphic init that normalizes a store before render
therefore renders **pre-update** state on the server → wrong first paint + hydration
mismatch.

Run `npm run repro`. On `2.0.0-beta.17` it prints **FAIL — bug reproduced** (the
return-form kept the completed "Old draft" todo on the server); the mutation-form
control drops it. Expected: server drops it like the client.

This is a **regression** — Solid 1.x honored the return-form on both sides.

Solid `2.0.0-beta.17`. Issue draft: `issue-drafts/53-store-setter-return-noop.md`.
