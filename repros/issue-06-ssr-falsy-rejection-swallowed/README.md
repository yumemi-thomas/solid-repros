# issue-06 — SSR swallows falsy async rejections

An async `createMemo` that rejects with a **falsy** value (`undefined` / `""`)
inside `<Loading>` + `<Errored>` renders its **children as if resolved** during
SSR, instead of the `<Errored>` fallback. A real `Error` correctly reaches the
fallback (control) — the divergence is truthiness-based.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

Pinned to published `2.0.0-beta.16` (npm); also reproduces on `2.0.0-beta.15`.
Issue draft: `issue-drafts/06-ssr-falsy-rejection-swallowed.md`.
