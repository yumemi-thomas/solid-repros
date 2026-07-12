// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: the server build of action(fn) returns the raw generator
// function unwrapped, so calling the "action" just instantiates a Generator: the
// body never runs (not even before the first yield) and there is no .then. The
// client returns a promise-driving wrapper. Isomorphic `await save(...)` on the
// server then reads as success (await on a non-thenable resolves immediately)
// while none of its work happened.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/69-action-returns-generator.md
import { action } from "solid-js";

let executed = false;
const saveNote = action(function* (text) {
  executed = true;
  yield Promise.resolve(); // stands in for `yield fetch("/api/notes", …)`
  return `saved: ${text}`;
});

const result = saveNote("hello");
const isPromise = typeof result?.then === "function";

// client (expected): result is a Promise (toStringTag "Promise"), body ran
const ok = isPromise && executed;

console.log(`typeof result.then:            ${typeof result?.then}`);
console.log(`  result[Symbol.toStringTag]:  ${String(result?.[Symbol.toStringTag])}`);
console.log(`  body executed:               ${executed}`);

function verdict() {
  console.log("\n=== server action(fn) returns a raw Generator; body never runs ===");
  console.log(
    ok
      ? "PASS — bug is fixed (server action returns a promise and the body runs)"
      : `FAIL — bug reproduced: got a ${String(result?.[Symbol.toStringTag])}, body executed=${executed}`,
  );
}

if (isPromise) result.then((v) => (console.log(`  resolved with: ${v}`), verdict()));
else verdict();
