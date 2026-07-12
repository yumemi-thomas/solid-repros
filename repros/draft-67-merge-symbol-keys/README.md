# draft-67 — server `merge()` drops symbol-keyed props from function sources (SSR)

SSR/client asymmetry (Solid **2.0.0-beta.17**). `merge()` with a **function**
source loses that source's symbol-keyed props on the server: they disappear from
`Reflect.ownKeys` and from spreads while a direct read still works. The client
keeps them (#2769). Scope is precise — the drop is proxy-path only; a
plain-object-only `merge()` is symmetric (shown as a control in the output).

Run: `npm run repro` (terminal). Prints server-actual `ownKeys`/spread + the
client-expected shape, then PASS/FAIL. On beta.17 it FAILs.

Issue draft: `issue-drafts/67-merge-symbol-keys.md`
