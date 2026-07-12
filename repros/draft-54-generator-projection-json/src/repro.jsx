// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: when a createProjection compute is an async generator,
// the SERVER locks the SSR-visible state at the first yield via
// JSON.parse(JSON.stringify(state)). Every JSON limitation becomes a divergence:
//   Date -> ISO string (Date methods throw server-only), Map/Set -> {}, NaN -> null,
//   and a CYCLIC yielded state makes JSON.stringify throw -> SSR crash.
// The CLIENT commits the yielded values as-is through the projection reconcile
// path, so the same compute keeps real Date/Map/Set instances and cycles.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/54-generator-projection-json.md
import { createProjection } from "solid-js";

// Part 2 (cyclic state) produces an unhandled rejection that would crash SSR —
// report it as the reproduction instead of dying silently.
process.on("unhandledRejection", (e) => {
  console.log(
    `\nPart 2 — cyclic state: CRASH (unhandled rejection): ${e.constructor.name}: ${e.message.split("\n")[0]}`,
  );
  console.log(
    "\nFAIL — bug reproduced: generator projection state went through JSON.parse(JSON.stringify(...)); cyclic state crashed SSR",
  );
  process.exit(1);
});

const results = [];
function check(label, actual, expected) {
  const ok = Object.is(actual, expected);
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} ${label}\n  client (expected): ${String(expected)}\n  server (actual):   ${String(actual)}`);
}

// Part 1 — a dashboard stats projection yielding rich values.
const stats = createProjection(
  async function* () {
    yield {
      lastUpdated: new Date("2026-07-12T00:00:00Z"),
      visitors: new Map([["home", 42]]),
      tags: new Set(["beta"]),
      score: NaN,
    };
  },
  { lastUpdated: new Date(0), visitors: new Map(), tags: new Set(), score: 0 },
);

await new Promise((r) => setTimeout(r, 20)); // let the first yield settle

check("lastUpdated instanceof Date", stats.lastUpdated instanceof Date, true);
try {
  check("lastUpdated.toLocaleDateString()", stats.lastUpdated.toLocaleDateString("en-US"), "7/12/2026");
} catch (e) {
  results.push(false);
  console.log(`FAIL lastUpdated.toLocaleDateString() threw\n  ${e.constructor.name}: ${e.message}`);
}
check("visitors instanceof Map", stats.visitors instanceof Map, true);
check("visitors.get('home')", stats.visitors.get?.("home"), 42);
check("tags instanceof Set", stats.tags instanceof Set, true);
check("score is NaN", Number.isNaN(stats.score), true);

// Part 2 — cyclic state (a tree node with an ordinary parent back-reference).
const doc = createProjection(
  async function* () {
    const node = { name: "root", parent: null };
    node.parent = node; // ordinary parent back-reference
    yield { tree: node };
  },
  { tree: null },
);

await new Promise((r) => setTimeout(r, 20));

console.log(`\nPart 2 — cyclic state survived; tree.name = ${doc.tree?.name}, cycle intact: ${doc.tree?.parent === doc.tree}`);
console.log(
  results.every(Boolean)
    ? "\nPASS — bug is fixed (server exposes the yielded values as-is)"
    : "\nFAIL — bug reproduced: generator projection state went through JSON.parse(JSON.stringify(...))",
);
