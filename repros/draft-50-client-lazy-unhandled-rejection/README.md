# draft-50 — client `lazy()` fires a phantom global `unhandledrejection`

SSR/client asymmetry (Solid **2.0.0-beta.17**). When a `lazy()` module promise
rejects (a failed chunk load), the UI recovers correctly via `<Errored>`, but the
client `lazy()` also attaches a bare success-only `.then()` to the module promise.
That discarded derived promise has no rejection arm, so every failed chunk load
additionally fires a global `unhandledrejection` — phantom error-tracker noise. The
`preload()` path leaks the same way even when the caller `.catch()`es the returned
promise. The server `lazy()` was fixed for exactly this in #2780; the client wasn't.

Run: `npm run dev` and open the preview — the verdict renders on the page.

Issue draft: `issue-drafts/50-client-lazy-unhandled-rejection.md`
