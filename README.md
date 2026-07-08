# solid-repros

Minimal, self-contained reproductions for [SolidJS](https://github.com/solidjs/solid)
issues. Each folder under [`repros/`](./repros) is a standalone Vite + Solid app
that opens directly in StackBlitz — no local setup required.

## Open a repro in StackBlitz

Point StackBlitz at the repro's subfolder:

```
https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/<slug>
```

For example:

- [`repros/issue-1234-signal-batch`](https://stackblitz.com/github/yumemi-thomas/solid-repros/tree/main/repros/issue-1234-signal-batch)

StackBlitz treats the folder in the URL as the project root, runs `npm install`,
then `npm run dev`. That's why each repro carries its own `package.json`.

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
