// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: projection / derived-store commits use Object.assign on
// the SERVER instead of the keyed `reconcile` the client uses. So keys the next
// state dropped survive as phantoms, and a shortened array keeps a stale tail.
// Client commits the SAME returns through reconcile → the correct, shorter shape.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/52-projection-assign-not-reconcile.md
import { createProjection, createStore, createOptimisticStore } from "solid-js";

// A filtered product list: each compute RETURNS its next state (the documented
// commit form) computed from a smaller / reshaped source.
const products = [
  { id: 1, name: "Trail Pack" },
  { id: 2, name: "Camp Stove" },
  { id: 3, name: "Head Lamp" },
];

const results = [];
function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  results.push(a === e);
  console.log(`${a === e ? "PASS" : "FAIL"} ${label}\n  client (expected): ${e}\n  server (actual):   ${a}`);
}

// 1. Array commit: the filter removed the last row.
const visible = createProjection(() => products.filter((p) => p.id !== 3), [...products]);
check("createProjection array (3 seed rows -> 2 visible)", [...visible], products.slice(0, 2));

// 2. Object commit: the returned state no longer has the seed's key.
const filters = createProjection(() => ({ inStock: true }), { onSale: true });
check("createProjection object ({onSale} seed -> {inStock})", { ...filters }, { inStock: true });

// 3-4. Derived-store forms commit through the same server path.
const [derived] = createStore(() => products.filter((p) => p.id !== 3), [...products]);
check("createStore(fn, seed) array", [...derived], products.slice(0, 2));

const [optimistic] = createOptimisticStore(() => ({ inStock: true }), { onSale: true });
check("createOptimisticStore(fn, seed) object", { ...optimistic }, { inStock: true });

console.log(
  "\n=== SSR projection commit uses Object.assign, not reconcile (server-only) ===",
);
console.log(
  results.every(Boolean)
    ? "PASS — bug is fixed (server now reconciles)"
    : "FAIL — bug reproduced: server kept phantom keys / stale array tails",
);
