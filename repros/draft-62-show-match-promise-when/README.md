# draft-62 — server `<Show when={promise}>` / `<Match when={promise}>` treats the pending Promise as truthy

On the **client**, a Promise passed to `<Show when>` / `<Match when>` is routed
through the async machinery: the boundary suspends and the callback receives the
**resolved** value. On the **server**, `when` is read in a plain sync memo with no
thenable detection, so a pending Promise is just a truthy object:
`when={Promise.resolve(false)}` renders the **children** (wrong branch), the keyed
callback gets the **raw Promise**, and the first pending `<Match>` wins — a content
flip and a guaranteed hydration mismatch.

Run `npm run repro`. On `2.0.0-beta.17` it prints **FAIL — bug reproduced**: server
gives `Delete post` / `Hello ` (raw Promise) / `owner tools`. Expected (client):
`read-only` / `Hello Ada` / `overview`.

The asymmetry is new in 2.0 (1.x treated the Promise as truthy on both sides).

Solid `2.0.0-beta.17`. Issue draft: `issue-drafts/62-show-match-promise-when.md`.
