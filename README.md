# solid-repros

Minimal, self-contained reproductions for [SolidJS](https://github.com/solidjs/solid)
issues. Each folder under [`repros/`](./repros) is a standalone Vite + Solid app
that opens directly in StackBlitz — no local setup required.

## Open a repro in StackBlitz

Point StackBlitz at the repro's subfolder:

```
https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/<slug>
```

StackBlitz treats the folder in the URL as the project root, runs `npm install`,
then the start command. Client repros run `npm run dev` and open the preview;
SSR repros run `npm run repro` and print `PASS`/`FAIL` in the **terminal**.

## Repros

Solid 2.0.0-beta.15 bug-hunt findings (each pinned to `solid-js@2.0.0-beta.15`
+ `@solidjs/web@2.0.0-beta.15`; open the link, read the on-screen verdict for
client repros or the terminal for SSR):

Client (in-browser verdict):

- [issue-12 — store descriptor reports stale `.value`](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-12-store-descriptor-stale-value)
- [issue-15 — effect `error` handler gets `StatusError` wrapper](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-15-effect-error-statuserror-wrapper)
- [issue-16 — `createReaction` re-arm accumulates arms](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-16-createreaction-rearm-accumulates)
- [issue-20 — `render()` dispose wipes pre-existing content](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-20-render-dispose-wipes-content)

SSR (terminal verdict — `npm run repro`):

- [issue-06 — SSR swallows falsy async rejections](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-06-ssr-falsy-rejection-swallowed)
- [issue-07 — SSR crashes on non-Promise thenables](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-07-ssr-thenable-crash)
- [issue-08 — `lazy()` in `<NoHydration>` renders nothing](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-08-ssr-nohydration-lazy-empty)
- [issue-09 — boundary-id leak breaks root `lazy()` hydration](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-09-ssr-boundary-id-asset-leak)
- [issue-17 — nested `<Loading>` enrolled in ancestor `<Reveal>` group](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-17-ssr-reveal-nested-loading)

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
- **Solid version:** `solid-js: "next"` + `@solidjs/web: "next"` +
  `vite-plugin-solid: "next"` targets Solid 2.0 (currently `2.0.0-beta.x`). For
  a Solid 1.x repro, use `solid-js: "latest"` with `vite-plugin-solid: "latest"`
  and import `render` from `solid-js/web` (drop `@solidjs/web`).

## Creating a repro

From the [`solid`](https://github.com/solidjs/solid) repo, run the
`create-repro` skill (`/create-repro`), which scaffolds a new folder here and
prints the StackBlitz URL.
