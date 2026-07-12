# draft-55 — `deep(store)` returns the live store on the server (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). `deep()` is documented to return
a plain (non-proxy) **deep copy** of a store. On the client it does. On the
**server** it is the identity function — `deep(store) === store` is `true`, so
mutating the returned "copy" (e.g. normalizing a payload before logging) silently
rewrites the store's rendered state. The identical client code leaves the store
untouched because the result is genuinely detached.

Run: `npm run repro` (terminal). Prints the identity check, the store's state
after normalizing the copy, and a PASS/FAIL verdict. On beta.17 it FAILs.

Issue draft: `issue-drafts/55-deep-returns-live-store.md`
