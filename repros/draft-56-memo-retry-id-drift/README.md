# draft-56 — async server memo retry appends hydration child-id slots

In streaming SSR, the non-sync `createMemo` re-runs its compute under the same
owner after a `NotReadyError` (pending async read) **without** disposing the
previous run's children or resetting `_childCount` — unlike the client, which
restarts child-id allocation at slot 0 on every recompute (and unlike the
sync-memo path fixed by #2801). Any memo body that allocates hydration ids
(here `createUniqueId()`) therefore emits a **drifted** id into the SSR HTML
that the client never agrees with: `createUniqueId` server/client parity is
broken, and with JSX in the memo the same drift shifts `_hk` claim keys.

Run `npm run repro` and read the **terminal** verdict (`PASS`/`FAIL`).

- CONTROL (sync source): compute runs once → `["00"]` → PASS
- REPRO (pending async source): discovery + retry append slots → `["10","11"]`,
  HTML shows the drifted `field:11` → FAIL

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/56-memo-retry-id-drift.md`.
