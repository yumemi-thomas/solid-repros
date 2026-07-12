// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: getObserver() — the "subscribe only if tracked" escape
// hatch — diverges on the SERVER in three observable ways:
//   1. sync memos (what the compiler emits for every JSX expression) see null,
//   2. untrack() does NOT clear it (server untrack is a passthrough),
//   3. where non-null, the value is the internal ServerComputation record, not
//      the Owner the type promises.
// The CLIENT is non-null in tracking scopes, null under untrack, and an Owner.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/70-getobserver-sync-scope.md
import { createMemo, getObserver, untrack } from "solid-js";

const results = [];
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  results.push(ok);
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label}\n  client (expected): ${JSON.stringify(expected)}\n  server (actual):   ${JSON.stringify(actual)}`
  );
}

// Async-capable memo: the "subscribe only if tracked" probe + the untrack facet.
const probe = createMemo(() => ({
  tracked: getObserver() !== null,
  insideUntrack: untrack(() => getObserver()) !== null,
  // facet 3: what shape does a non-null observer actually have here?
  keys: (() => {
    const o = getObserver();
    return o ? Object.keys(o).sort() : null;
  })()
}));

// Sync memo — exactly what the compiler emits for JSX expressions (_$memo).
const jsxLike = createMemo(() => getObserver() !== null, { sync: true });

const p = probe();

// Client: inside a tracking memo getObserver() is non-null.
check("getObserver() non-null inside a tracking memo", p.tracked, true);

// Client: untrack() clears the observer -> null. Server passthrough keeps it.
check("getObserver() is null inside untrack()", p.insideUntrack, false);

// Client: compiler-style sync/JSX memos are a tracking scope -> non-null.
check("getObserver() non-null inside a sync (JSX) memo", jsxLike(), true);

// Client: the observer is an Owner (has owner/context/... reactive-node shape),
// NOT the server's internal computation record.
const isServerComputationRecord =
  Array.isArray(p.keys) &&
  ["compute", "computed", "disposed", "error", "errored", "owner", "value"].every(
    (k) => p.keys.includes(k)
  );
check(
  "getObserver() is NOT the internal ServerComputation record",
  isServerComputationRecord,
  false
);

console.log("\n  (server observer keys were: " + JSON.stringify(p.keys) + ")");
console.log("\n=== getObserver() server divergence (sync-null / untrack / shape) ===");
console.log(
  results.every(Boolean)
    ? "PASS — bug is fixed (server getObserver matches the client contract)"
    : "FAIL — bug reproduced: server getObserver diverges (sync memo null, untrack not cleared, foreign object shape)"
);
