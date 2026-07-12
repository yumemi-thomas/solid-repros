// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: the server build of flush() is a zero-arg no-op, so the
// flush(fn) overload silently drops the callback and returns undefined. The
// client runs fn inside a sync-flush scope and returns its result. Isomorphic
// setup work done inside flush(() => …) therefore just never happens under SSR.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/68-flush-callback-dropped.md
import { flush } from "solid-js";

let ran = false;
const result = flush(() => {
  ran = true; // isomorphic setup work, e.g. seeding stores before first paint
  return 42;
});

// client (expected): ran === true; result === 42
const ok = ran && result === 42;

console.log(`callback ran: ${ran}`);
console.log(`  returned:   ${String(result)}`);

console.log("\n=== server flush(fn) silently drops the callback ===");
console.log(
  ok
    ? "PASS — bug is fixed (server runs the flush callback and returns its result)"
    : `FAIL — bug reproduced: callback ${ran ? "ran" : "never ran"}, returned ${String(result)} (expected 42)`,
);
