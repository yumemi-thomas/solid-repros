// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR crashes with a TypeError when an async createMemo returns a non-Promise
// thenable (a PromiseLike — the shape of a knex/mongoose query builder). The
// client awaits any Promises/A+ object; the server only checks
// `result instanceof Promise`, stores the thenable as a sync value, and
// dereferences undefined deep in the node resolver. — Solid 2.0.0-beta.16
// Issue draft: issue-drafts/07-ssr-thenable-crash.md
import { renderToStringAsync } from "@solidjs/web";
import { createMemo, Loading } from "solid-js";

// A Promises/A+ thenable that is NOT a native Promise —
// the shape of a knex query builder / mongoose query object.
function query() {
  return {
    then(onFulfilled, onRejected) {
      return new Promise((r) => setTimeout(() => r("Ada"), 10)).then(
        onFulfilled,
        onRejected
      );
    },
  };
}

function App() {
  const user = createMemo(() => query());
  return (
    <Loading fallback={<span>Loading...</span>}>
      <p>Hello {user()}</p>
    </Loading>
  );
}

let html = "";
let crashed = false;
let error;
try {
  html = await renderToStringAsync(() => <App />);
} catch (e) {
  crashed = true;
  error = e;
}

// Expected: the server awaits the thenable like the client and renders "Ada".
// Bug: it throws `TypeError: Cannot read properties of undefined (reading 'fn')`.
const ok = !crashed && html.includes("Ada");

console.log("=== SSR non-Promise thenable crash (server-only) ===");
console.log(ok ? "PASS — bug fixed" : "FAIL — bug reproduced");
console.log('expected: renders "Hello Ada" (server awaits the thenable like the client)');
console.log(
  "actual:  ",
  crashed ? `crashed: ${error?.name}: ${error?.message}` : `html: ${html}`
);
if (crashed) console.error(error);
