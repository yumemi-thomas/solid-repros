# solid-repros

Minimal, self-contained reproductions for [SolidJS](https://github.com/solidjs/solid)
issues. Each folder under [`repros/`](./repros) is a standalone Vite + Solid app
that opens directly in StackBlitz — no local setup required.

## Open a repro in StackBlitz

Each repro has a **launcher page** hosted on GitHub Pages:

```
https://yumemi-thomas.github.io/solid-repros/<slug>.html
```

Opening it POSTs the repro's files straight into StackBlitz (`stackblitz.com/run`,
`template: node`) and auto-starts it — no GitHub import, so it's immune to the
subfolder-import failures the classic `stackblitz.com/github/...` URLs hit. The
project is ephemeral (fork it in StackBlitz to save). Client repros open the
preview; SSR repros run `npm run repro` and print `PASS`/`FAIL` in the **terminal**.

The launchers are generated from the repro folders — after editing a repro, run:

```
node tools/build-launchers.mjs
```

which regenerates `docs/<slug>.html` (+ `docs/index.html`). See the full index at
<https://yumemi-thomas.github.io/solid-repros/>.

> The raw folders under [`repros/`](./repros) are still standalone Vite apps you
> can clone and run locally (`npm install && npm run dev`).

## Repros

Solid 2.0 bug-hunt findings. Each runs against published `2.0.0-beta.16` (npm);
open the link and read the on-screen verdict for client repros or the terminal
for SSR. All still reproduce on beta.16. (issue-12 dropped — fixed by #2836;
issue-15 dropped — fixed by #2840.)

Client (in-browser verdict):

- [issue-16 — `createReaction` re-arm accumulates arms](https://yumemi-thomas.github.io/solid-repros/issue-16-createreaction-rearm-accumulates.html)
- [issue-20 — `render()` dispose wipes pre-existing content](https://yumemi-thomas.github.io/solid-repros/issue-20-render-dispose-wipes-content.html)

SSR (terminal verdict — `npm run repro`):

- [issue-06 — SSR swallows falsy async rejections](https://yumemi-thomas.github.io/solid-repros/issue-06-ssr-falsy-rejection-swallowed.html)
- [issue-07 — SSR crashes on non-Promise thenables](https://yumemi-thomas.github.io/solid-repros/issue-07-ssr-thenable-crash.html)
- [issue-08 — `lazy()` in `<NoHydration>` renders nothing](https://yumemi-thomas.github.io/solid-repros/issue-08-ssr-nohydration-lazy-empty.html)
- [issue-09 — boundary-id leak breaks root `lazy()` hydration](https://yumemi-thomas.github.io/solid-repros/issue-09-ssr-boundary-id-asset-leak.html)
- [issue-17 — nested `<Loading>` enrolled in ancestor `<Reveal>` group](https://yumemi-thomas.github.io/solid-repros/issue-17-ssr-reveal-nested-loading.html)

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
