// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// The server `dynamic()` stores a promise rejection as `error = err` and replays
// it with `if (error) throw error`. A FALSY rejection reason (undefined, null,
// 0, "") passes the truthiness check and is treated as SUCCESS with an undefined
// component: the <Loading> fragment serializes as resolved-success with an empty
// slot, no error crosses the wire, and hydration never reaches <Errored>.
// Same falsy-rejection class as #2857 (fixed in lazy(), missed in dynamic).
// A control rejecting with a real Error serializes the error correctly.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/49-dynamic-falsy-rejection.md
import { renderToStream, dynamic } from "@solidjs/web";
import { Errored, Loading } from "solid-js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function collectChunks(code) {
  return new Promise((resolve) => {
    const chunks = [];
    renderToStream(code).pipe({
      write: (chunk) => chunks.push(chunk),
      end: () => resolve(chunks),
    });
  });
}

function makeApp(reason) {
  const loadPanel = async () => {
    await sleep(10);
    return Promise.reject(reason);
  };
  const Panel = dynamic(() => loadPanel());
  return function App() {
    return (
      <main>
        <h1>Dashboard</h1>
        <Errored fallback={(err) => <p>panel failed: {String(err())}</p>}>
          <Loading fallback={<p>loading panel…</p>}>
            <Panel />
          </Loading>
        </Errored>
      </main>
    );
  };
}

const outcomes = [];
async function run(label, reason, expectRejected) {
  const App = makeApp(reason);
  const full = (await collectChunks(() => <App />)).join("");
  // The fragment's serialized promise is driven into a terminal state:
  //   `.p.s = 2` → rejected (error signaled);  `.p.s = 1` → resolved success.
  // (Format is minified — match the resolver-state assignment, not the layout.)
  const rejected = /\.p\.s\s*=\s*2\b/.test(full);
  const resolvedAsSuccess = /\.p\.s\s*=\s*1\b/.test(full);
  const signaled = rejected && !resolvedAsSuccess;
  outcomes.push(signaled === expectRejected);
  console.log(`\n${label}`);
  console.log(`  server serialized rejection? ${signaled}  (expected ${expectRejected})`);
  console.log(
    signaled
      ? "  → rejection signaled to the client"
      : "  → fragment serialized as resolved success, empty slot, no error",
  );
}

// Control: a truthy Error rejection is signaled correctly.
await run("CONTROL — rejection with an Error", new Error("panel chunk missing"), true);
// Repro: a falsy (undefined) rejection is swallowed and serialized as success.
await run("REPRO — rejection with undefined", undefined, true);

// Client comparison (browser build of the REPRO tree), for reference:
//   client DOM (pending): <main><h1>Dashboard</h1><p>loading panel…</p></main>
//   client DOM (settled): <main><h1>Dashboard</h1><p>panel failed: undefined</p></main>
// Pure CSR routes the same falsy rejection to <Errored>; only SSR swallows it.

console.log("\n=== server dynamic() swallows falsy promise rejections (server-only) ===");
console.log(
  outcomes.every(Boolean)
    ? "PASS — bug is fixed (falsy rejection signaled to the client)"
    : "FAIL — bug reproduced: falsy rejection serialized as resolved success, no <Errored>",
);
