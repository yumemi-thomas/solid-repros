// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: the writable-memo form createSignal(fn, { lazy: true })
// diverges on the SERVER in two ways:
//   1. `lazy: true` is dropped -> the compute runs EAGERLY at creation (wasted
//      SSR work for values never read this pass: a closed panel, an inactive tab),
//   2. the setter returns `undefined` instead of the written value.
// The CLIENT honors lazy (0 computes for a never-read memo) and its setter
// returns the value it wrote.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/71-writable-memo-lazy-setter.md
import { createSignal } from "solid-js";

const results = [];
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  results.push(ok);
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label}\n  client (expected): ${JSON.stringify(expected)}\n  server (actual):   ${JSON.stringify(actual)}`
  );
}

let fetches = 0;
// Writable memo backing a panel the user may never open this SSR pass.
const [details, setDetails] = createSignal(
  () => {
    fetches++; // stands in for fetch("/api/details")
    return "fetched";
  },
  { lazy: true }
);

// details() is NEVER read -> with lazy honored, the compute must not have run.
check("lazy memo never read -> 0 computes", fetches, 0);

// The documented `const v = setX(next)` shape: setter returns the written value.
const returned = setDetails("override");
check("setter returns the written value", returned, "override");

console.log("\n=== writable memo drops `lazy` + setter returns undefined (server-only) ===");
console.log(
  results.every(Boolean)
    ? "PASS — bug is fixed (server honors lazy and returns the written value)"
    : "FAIL — bug reproduced: server computed eagerly despite lazy:true and/or setter returned undefined"
);
