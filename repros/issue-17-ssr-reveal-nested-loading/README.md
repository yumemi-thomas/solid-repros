# issue-17 — nested `<Loading>` enrolled in ancestor `<Reveal>` group

Streaming SSR: a `<Loading>` boundary **nested** inside another `<Loading>`
registers into the ancestor `<Reveal order="together">` group as if it were a
direct slot. The group then holds the already-ready outer content hostage until
the slow nested boundary resolves. Only **direct** slots should participate —
the client clears the reveal context for children; the server does not.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

Pinned to published `2.0.0-beta.16` (npm); also reproduces on `2.0.0-beta.15`.
Issue draft: `issue-drafts/17-reveal-nested-loading-grouping.md`.
