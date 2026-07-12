# draft-54 — generator projection state is locked through a JSON round-trip (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). When a `createProjection`
compute is an async generator, the server locks the SSR-visible state at the
first yield with `JSON.parse(JSON.stringify(state))`. Every JSON limitation
becomes a server/client divergence: a `Date` reads back as a string (date
methods throw server-only), `Map`/`Set` become `{}`, `NaN` becomes `null`, and
cyclic yielded state makes `JSON.stringify` throw and crashes SSR.

The client commits the yielded values as-is through the projection reconcile
path, so the same compute keeps real `Date`/`Map`/`Set` instances and cycles.

Run: `npm run repro` (terminal). Prints PASS/FAIL per value with the
server-actual, then hits the cyclic crash. On beta.17 it FAILs.

Issue draft: `issue-drafts/54-generator-projection-json.md`
