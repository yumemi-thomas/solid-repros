# draft-43 (TanStack Start) — `<Errored>`-wrapped `<Loading>` joins the `<Reveal>` group on the server, not on the client

A checkout page streams under `<Reveal order="together">`: an order summary
(300ms) and a flaky third-party payment panel (2000ms) that is wrapped in
`<Errored>` for robustness — exactly what TanStack Router's `CatchBoundary`
(= `Solid.Errored`) does automatically around any route with an
`errorComponent` / `defaultErrorComponent`.

The client deliberately treats error-boundary-wrapped slots as **outside** the
group (so an erroring slot can't stall reveal progression). The server enrolls
them. Same tree, two behaviors:

- **Hard refresh (SSR):** 2-key `$dfj`, everything held on skeletons to ~2s.
- **SPA navigation** (`/control` → `/`): order summary reveals at ~300ms, the
  panel independently at ~2s.

Your error boundary — or one your router injected that you never wrote —
silently changes reveal timing depending on how the user arrived.

`npm start` (StackBlitz runs it automatically) boots the dev server, streams
`/control` (no `Errored`; a 2-key group coordinating at ~2s is CORRECT there)
and `/` (Errored-wrapped panel; client semantics require a 1-key group at
~300ms), prints the verdict in the **terminal**, then leaves the server
running — compare SPA navigation vs hard refresh in the preview.

Versions: `@tanstack/solid-start@2.0.0-beta.24`, `@tanstack/solid-router@2.0.0-beta.23`,
`solid-js@2.0.0-beta.17`, `@solidjs/web@2.0.0-beta.17`, `vite-plugin-solid@3.0.0-next.7`.

Issue draft: `issue-drafts/43-errored-reveal-scope.md` (sibling of solidjs/solid#2871;
not fixed by it — the server severing must also be ported to `createErrorBoundary`).
