# draft-59 — `readHydratedValue` mis-sniffs `{s,v}`/`{v}`-shaped user payloads

SSR/client asymmetry (Solid **2.0.0-beta.17**). A `deferStream` server render writes
the RAW resolved value into `_$HY.r[id]`, sharing the namespace with promise
envelopes and with no discriminator. The client's `readHydratedValue` sniffs
`.s`/`.v` on whatever it loads, so a legitimate payload `{ s: 2, v: "payload" }`
is misread as a rejected-promise envelope → the client throws; `{ v: "inner" }`
is silently unwrapped to `"inner"` (corruption). Same function as draft 26,
opposite manifestation.

Run: `npm run dev` and open the preview — two probes report PASS/FAIL on the page.

Issue draft: `issue-drafts/59-readhydratedvalue-envelope.md`
