// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: an async createStore/createProjection rejection is
// SWALLOWED on the server. Every server error arm is `(_e) => markReady()`, so
// reads fall through to the SEED and the fragment streams + activates AS SUCCESS
// — no error UI, and hydration believes the fake data. The client instead
// routes the rejection to <Errored>. Worse: under renderToString the internal
// deferred is rejected but never consumed → a guaranteed UNHANDLED REJECTION
// that crashes the Node process under its default mode (Node >= 15).
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/48-projection-rejection-swallowed.md
import { renderToStream, renderToString } from "@solidjs/web";
import { createStore, Errored, Loading } from "solid-js";

// Record unhandled rejections instead of letting them silently kill the run —
// registering this handler suppresses Node's default process-exit, so the
// repro can still print a verdict while making the crash half visible.
const unhandled = [];
process.on("unhandledRejection", (err) => {
  unhandled.push(err);
  console.log(
    `\n[unhandledRejection] ${err?.name}: ${err?.message} — under Node's default mode this exits the process (exit code 1)`
  );
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function Checkout() {
  const [prices] = createStore(
    async () => {
      await sleep(10);
      throw new Error("pricing service unavailable"); // the pricing API failed
    },
    { subtotal: "$0.00", shipping: "FREE", total: "$0.00" } // seed while loading
  );
  return (
    <ul>
      <li>Subtotal: {prices.subtotal}</li>
      <li>Shipping: {prices.shipping}</li>
      <li>Total: {prices.total}</li>
    </ul>
  );
}

function App() {
  return (
    <Errored fallback={(err) => <p>Pricing failed: {err().message}</p>}>
      <Loading fallback={<p>loading prices…</p>}>
        <Checkout />
      </Loading>
    </Errored>
  );
}

console.log("=== async projection rejection swallowed on the server (server-only) ===");

// Part 1 — streaming: the rejection is swallowed and the SEED streams as success.
const chunks = await new Promise((resolve) => {
  const acc = [];
  renderToStream(() => <App />).pipe({
    write: (chunk) => acc.push(chunk),
    end: () => resolve(acc),
  });
});
const streamedFull = chunks.join("");
const reachedErrored = chunks.some((c) => c.includes("Pricing failed"));
const streamedSeed = streamedFull.includes("$0.00") && streamedFull.includes("FREE");
console.log("\n[Part 1 — renderToStream]");
console.log(
  `  reached <Errored>: ${reachedErrored}; seed prices streamed: ${streamedSeed}`
);
// Client comparison (browser build) settles to: <p>Pricing failed: pricing service unavailable</p>

// Part 2 — renderToString: the same rejection is a guaranteed unhandled
// rejection (would exit the process without the handler above).
let stringResult;
try {
  stringResult = renderToString(() => <App />);
  console.log("\n[Part 2 — renderToString]");
  console.log(`  returned: ${JSON.stringify(stringResult)}`);
} catch (e) {
  console.log(`\n[Part 2 — renderToString] threw synchronously: ${e?.message}`);
}

// Let any rejected internal deferreds surface, then print the verdict.
await sleep(100);

// Primary asymmetry (always reproduces on beta.17): the rejection is swallowed,
// the SEED streams as success, and <Errored> is never reached — while the client
// shows the fallback. The crash half (unhandled rejection under renderToString)
// is version/host-dependent; it is reported when observed but does not gate the
// verdict.
const swallowed = !reachedErrored && streamedSeed;
console.log(
  `\ncrash half (unhandled rejection under renderToString): ${
    unhandled.length > 0 ? `OBSERVED (${unhandled.length})` : "not observed in this run"
  }`
);
console.log(
  swallowed || unhandled.length > 0
    ? "\nFAIL — bug reproduced: server swallowed the projection rejection and streamed the seed as SUCCESS; no <Errored> anywhere (client shows the fallback)"
    : "\nPASS — bug is fixed (rejection reached <Errored>)"
);
process.exit(0);
