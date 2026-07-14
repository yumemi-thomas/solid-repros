# solid-repros

Minimal, self-contained reproductions for [SolidJS](https://github.com/solidjs/solid)
issues. Each folder under [`repros/`](./repros) is a standalone Vite + Solid app
that opens directly in StackBlitz — no local setup required.

The active `issue-drafts` set is fully mirrored here. Browser and hydration
issues open as small interactive Vite apps; SSR issues use real TanStack Start
routes instead of isolated `renderToString`/`vite-node` scripts. Historical
repros for resolved drafts remain pinned for reference.

## Open a repro in StackBlitz

One **dynamic launcher** (GitHub Pages) opens any repro by slug:

```
https://yumemi-thomas.github.io/solid-repros/launch.html?repro=<slug>
```

The launcher does one same-origin fetch of `docs/repros.json` (a manifest that
embeds each repro's files) and POSTs them straight into StackBlitz
(`stackblitz.com/run`, `template: node`) — no GitHub repo import (immune to the
subfolder-import failures the classic `stackblitz.com/github/...` URLs hit) and no
`raw.githubusercontent.com` fetches (which rate-limit / 429). The StackBlitz
project is ephemeral (fork it there to save). Repros open the preview; TanStack
Start projects also provide `npm run repro` for raw-response verification.

Index of all repros: <https://yumemi-thomas.github.io/solid-repros/>.

The manifest embeds file **contents**, so **regenerate it after editing any repro**
(then commit `docs/repros.json`):

```
node tools/build-manifest.mjs
```

> The raw folders under [`repros/`](./repros) are also standalone Vite apps you can
> clone and run locally (`npm install && npm run dev`).

## Repros

Solid 2.0 bug-hunt findings. Open the link and read the on-screen verdict for
client repros; Start repros also support `npm run repro` for a raw SSR request. `issue-NN` slugs use wave-1 finding
numbers; `draft-NN` slugs use the flattened `issue-drafts/` numbering (wave 2+).
The early waves below pin `2.0.0-beta.16`; the SSR/client symmetry batch
(`draft-44`–`draft-73`) pins `2.0.0-beta.17`. All still reproduce on their pinned
version. (Wave-1 repros for findings 12 and 15 were dropped — fixed by #2836 and #2840.)

### Active issue-draft coverage

All 63 active drafts (64 findings; draft 25 contains two) have a standalone project:

| Runtime | Active drafts | Repro shape |
|---|---|---|
| Browser | `02–09`, `13–22`, `33–35`, `37–41`, `50` | Small interactive Vite app with an on-page result |
| Hydration | `26–32` | Vite app using the real hydration runtime and visible diagnostics |
| SSR / SSR + hydration | `23`, `25`, `42`, `43`, `46–49`, `51–59`, `61–64`, `66–73` | Real TanStack Start route; hybrid cases include `<Scripts />` and hydrate in the browser |

Drafts `01`, `44`, `45`, `60`, and `65` are resolved and retained only as
historical pinned repros. Use the [generated repro index](https://yumemi-thomas.github.io/solid-repros/)
to open any active or historical project.

Client (in-browser verdict):

- [draft-10 — `Errored` fallback gets the internal `StatusError` wrapper for falsy rejections](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-10-errored-falsy-rejection-wrapper)
- [draft-11 — empty async iterable leaves `Loading` pending forever](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-11-empty-async-iterable-pends)
- [draft-12 — async-iterator sync rejection silently dropped](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-12-iterator-sync-rejection-dropped)
- [issue-16 — `createReaction` re-arm accumulates arms](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-16-createreaction-rearm-accumulates)
- [issue-20 — `render()` dispose wipes pre-existing content](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-20-render-dispose-wipes-content)

SSR (terminal verdict — `npm run repro`):

- [issue-06 — SSR swallows falsy async rejections](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-06-ssr-falsy-rejection-swallowed)
- [issue-07 — SSR crashes on non-Promise thenables](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-07-ssr-thenable-crash)
- [issue-08 — `lazy()` in `<NoHydration>` renders nothing](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-08-ssr-nohydration-lazy-empty)
- [issue-09 — boundary-id leak breaks root `lazy()` hydration](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-09-ssr-boundary-id-asset-leak)
- [issue-17 — nested `<Loading>` enrolled in ancestor `<Reveal>` group](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=issue-17-ssr-reveal-nested-loading)
- [draft-43 (TanStack Start) — `Errored`-wrapped `Loading` joins the `Reveal` group on the server, not on the client](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-43-tanstack-errored-reveal-scope)

## SSR/client symmetry audit (beta.17)

26 active reproductions from the [SSR/client rendering-symmetry audit](https://github.com/solidjs/solid) — cases where Solid 2.0's mirrored server implementation diverges from the client runtime. Each is pinned to `2.0.0-beta.17` and self-verifies (`FAIL` = bug reproduced). `❓` marks a design-question repro (shows both behaviors; the intended contract is for maintainers to confirm).

SSR and SSR + hydration (TanStack Start preview; optional `npm run repro`):

- [draft-46 — `createRevealOrder` is a server no-op; its children leak into the ancestor `<Reveal>` group](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-46-createrevealorder-server-noop)
- [draft-47 — `createEffect` compute throw → SSR renders the `<Errored>` fallback, client renders content](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-47-effect-throw-ssr-fallback)
- [draft-48 — async projection/store rejection swallowed → seed data streamed as success](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-48-projection-rejection-swallowed)
- [draft-49 — server `dynamic()` treats a falsy promise rejection as success](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-49-dynamic-falsy-rejection)
- [draft-51 — every SSR-side async rejection leaks 2 `unhandledrejection` events into the browser](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-51-ssr-rejection-client-unhandled)
- [draft-52 — projection/derived-store commit uses `Object.assign`, not keyed `reconcile`](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-52-projection-assign-not-reconcile)
- [draft-53 — store setter return-form is a silent no-op on the server](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-53-store-setter-return-noop)
- [draft-54 — generator projection SSR state round-trips through JSON (`Date`→string, cyclic crash)](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-54-generator-projection-json)
- [draft-55 — `deep()` returns the live store on the server, not a copy](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-55-deep-returns-live-store)
- [draft-56 — async memo NotReady retry appends hydration id slots (id drift)](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-56-memo-retry-id-drift)
- [draft-58 — server ignores `transparent: true` memo → hydration id drift, dropped update](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-58-transparent-memo-server)
- [draft-61 — a frozen user promise hangs the SSR stream forever](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-61-frozen-promise-hung-stream)
- [draft-62 — `<Show>`/`<Match> when={promise}` renders the wrong branch with the raw Promise](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-62-show-match-promise-when)
- [draft-63 — `<Switch>` with null resolved children crashes SSR (client renders the fallback)](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-63-switch-null-children-crash)
- [draft-64 — `<Repeat count={NaN}>` throws `RangeError` during hydration; SSR renders the fallback](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-64-repeat-count-nan-undefined)
- [draft-66 — server `dynamic()` evaluates its source once per instance (docs promise sharing)](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-66-dynamic-source-per-instance)
- [draft-67 — server `merge()` drops symbol keys from function sources](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-67-merge-symbol-keys)
- [draft-68 — server `flush(fn)` silently drops the callback](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-68-flush-callback-dropped)
- [draft-69 — server `action()()` returns a raw Generator, body never runs](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-69-action-returns-generator)
- [draft-70 ❓ — `getObserver()` is null in sync scopes / not cleared by `untrack` on the server](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-70-getobserver-sync-scope)
- [draft-71 — writable memo: `lazy` dropped (eager SSR compute), setter returns `undefined`](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-71-writable-memo-lazy-setter)
- [draft-72 ❓ — `resolve()` throws on the server while types claim `Promise<T>`](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-72-resolve-server-throw)
- [draft-73 — `createUniqueId()` outside a reactive context throws server-only](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-73-createuniqueid-outside-context)

Client (in-browser verdict):

- [draft-50 — client `lazy()` fires a phantom `unhandledrejection` on chunk-load failure](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-50-client-lazy-unhandled-rejection)
- [draft-57 — `createReaction` `track()` id-slot drift → unclaimed nodes / hydration mismatch](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-57-createreaction-id-slot)
- [draft-59 — `readHydratedValue` mis-sniffs `{s,v}`/`{v}` payloads (throw / silent corruption)](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=draft-59-readhydratedvalue-envelope)

## Structure

```
solid-repros/
  repros/
    draft-NN-browser-case/
      package.json
      index.html
      src/
        index.tsx       # render/hydrate from @solidjs/web
        App.tsx         # realistic scenario + visible result
    draft-NN-ssr-case/
      package.json
      vite.config.ts    # TanStack Start + Solid SSR
      scripts/repro.mjs # optional raw HTTP check
      src/routes/
        __root.tsx
        index.tsx       # the actual route reproduction
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
  Solid 2.0 release for durability (early waves `2.0.0-beta.16`; the SSR/client
  symmetry batch `2.0.0-beta.17`), with `vite-plugin-solid: "next"`. (`"next"` on
  `solid-js`/`@solidjs/web` also works and floats to the latest beta.) For a Solid
  1.x repro, use `solid-js: "latest"`
  with `vite-plugin-solid: "latest"` and import `render` from `solid-js/web`
  (drop `@solidjs/web`).

## Creating a repro

From the [`solid`](https://github.com/solidjs/solid) repo, run the
`create-repro` skill (`/create-repro`), which scaffolds a new folder here and
prints the StackBlitz URL.
