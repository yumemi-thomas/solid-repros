# solid-repros

Minimal, self-contained reproductions for [SolidJS](https://github.com/solidjs/solid)
issues. Each folder under [`repros/`](./repros) is a standalone Vite + Solid app
that opens directly in StackBlitz — no local setup required.

## Open a repro in StackBlitz

One **dynamic launcher** (GitHub Pages) opens any repro by slug:

```
https://yumemi-thomas.github.io/solid-repros/launch.html?repro=<slug>
```

The launcher fetches that repro's files **live from GitHub** (`raw.githubusercontent.com`,
CORS-enabled) and POSTs them straight into StackBlitz (`stackblitz.com/run`,
`template: node`) — no GitHub repo import, so it's immune to the subfolder-import
failures the classic `stackblitz.com/github/...` URLs hit. Because files are read
live, [`repros/`](./repros) stays the single source of truth: **editing a repro
needs no rebuild** — the link is instantly current. The StackBlitz project is
ephemeral (fork it there to save). Client repros open the preview; SSR repros run
`npm run repro` and print `PASS`/`FAIL` in the **terminal**.

Index of all repros: <https://yumemi-thomas.github.io/solid-repros/>.

The launcher reads `docs/repros.json`, a manifest of each repro's file **paths**
(not contents). Regenerate it only when files are **added or removed** from a repro:

```
node tools/build-manifest.mjs
```

> The raw folders under [`repros/`](./repros) are also standalone Vite apps you can
> clone and run locally (`npm install && npm run dev`).

## Repros

Solid 2.0 bug-hunt findings. Each runs against published `2.0.0-beta.16` (npm);
open the link and read the on-screen verdict for client repros or the terminal
for SSR. All still reproduce on beta.16. (issue-12 dropped — fixed by #2836;
issue-15 dropped — fixed by #2840.)

Client (in-browser verdict):

- [issue-16 — `createReaction` re-arm accumulates arms](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-16-createreaction-rearm-accumulates)
- [issue-20 — `render()` dispose wipes pre-existing content](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-20-render-dispose-wipes-content)

SSR (terminal verdict — `npm run repro`):

- [issue-06 — SSR swallows falsy async rejections](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-06-ssr-falsy-rejection-swallowed)
- [issue-07 — SSR crashes on non-Promise thenables](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-07-ssr-thenable-crash)
- [issue-08 — `lazy()` in `<NoHydration>` renders nothing](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-08-ssr-nohydration-lazy-empty)
- [issue-09 — boundary-id leak breaks root `lazy()` hydration](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-09-ssr-boundary-id-asset-leak)
- [issue-17 — nested `<Loading>` enrolled in ancestor `<Reveal>` group](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-17-ssr-reveal-nested-loading)

## Structure

```
solid-repros/
  repros/
    issue-1234-signal-batch/
      package.json      # deps + dev/build/preview scripts
      vite.config.js    # vite-plugin-solid
      index.html        # mounts /src/index.jsx
      src/
        index.jsx       # render(() => <App />, ...) from @solidjs/web
        App.jsx         # the reproduction
```

> **Solid 2.0 note:** `render` now lives in `@solidjs/web` (not `solid-js/web`,
> which no longer exists), and batching is automatic (no `batch` export). The
> template already reflects this.

## Conventions

- **Slug:** `issue-<number>-<short-kebab-name>` when there's a GitHub issue,
  otherwise just a `<short-kebab-name>`.
- **Self-contained:** everything the repro needs lives in its own folder.
- **Minimal:** the smallest program that shows the bug; show observed vs.
  expected on screen or in the console.
- **Solid version:** these repros pin `solid-js` + `@solidjs/web` to an exact
  Solid 2.0 release (currently `2.0.0-beta.16`) for durability, with
  `vite-plugin-solid: "next"`. (`"next"` on `solid-js`/`@solidjs/web` also works
  and floats to the latest beta.) For a Solid 1.x repro, use `solid-js: "latest"`
  with `vite-plugin-solid: "latest"` and import `render` from `solid-js/web`
  (drop `@solidjs/web`).

## Creating a repro

From the [`solid`](https://github.com/solidjs/solid) repo, run the
`create-repro` skill (`/create-repro`), which scaffolds a new folder here and
prints the StackBlitz URL.
