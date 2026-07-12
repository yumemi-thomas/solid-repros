# draft-58 — server ignores `createMemo(..., { transparent: true })` → hydration id drift

SSR/client asymmetry (Solid **2.0.0-beta.17**). The server consumes a hydration
id slot for a transparent memo; the client (which honors `transparent`) does not.
The emitted `_hk` ids drift by one, so the client claims the wrong node. Under the
dev build (the StackBlitz preview) hydrate throws the guard "Failed attempt to
create new DOM elements during hydration"; under prod the first post-hydration
update is silently dropped.

Run: `npm run dev` and open the preview — the verdict renders on the page.

Issue draft: `issue-drafts/58-transparent-memo-server.md`
