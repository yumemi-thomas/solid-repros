# draft-47 — `createEffect` compute throw bakes the `<Errored>` fallback into SSR HTML

A **compute-phase** throw in `createEffect` routes to opposite destinations on
server vs client. The **client** delivers it to the effect's own `error` arm
(or `console.error`) and renders the content normally. The **server** re-throws
it into the enclosing `<Errored>`, renders the error fallback into the SSR HTML,
and drops the `EffectBundle` entirely — the `error` arm never runs. So the same
tree produces the error page on a hard refresh and the real page on client-side
navigation.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).
Expected server (matching client): `<article>…` + `bundle arms called: ["error(…)"]`.
Actual on beta.17: `Something went wrong: …` + `bundle arms called: []`.

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/47-effect-throw-ssr-fallback.md`.
