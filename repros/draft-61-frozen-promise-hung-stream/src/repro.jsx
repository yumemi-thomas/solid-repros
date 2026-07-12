// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR bug: when a server memo returns a promise, the async settle path memoizes
// the outcome by ASSIGNING properties onto the user's promise (p.s = 1; p.v = …).
// If that promise is frozen (Object.freeze) the assignment throws inside the
// .then handler — so the internal deferred that gates the stream never settles
// and renderToStream NEVER ENDS. A plain promise (control) streams fine.
// Client: never mutates user promises → the same component renders fine.
// NOTE: this script guards the hang — each stream races end() against a 2s
// timeout, so `npm run repro` always terminates (process.exit at the bottom).
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/61-frozen-promise-hung-stream.md
import { renderToStream } from "@solidjs/web";
import { createMemo, Loading } from "solid-js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Race a stream's end() against a timeout — resolves either way, never hangs.
function streamEnds(code, timeoutMs) {
  return new Promise((resolvep) => {
    let settled = false;
    const chunks = [];
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolvep(`HUNG — stream did not end within ${timeoutMs}ms (chunks so far: ${chunks.length})`);
      }
    }, timeoutMs);
    renderToStream(code).pipe({
      write(chunk) {
        chunks.push(chunk);
      },
      end() {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolvep(`ENDED — ${chunks.length} chunks`);
        }
      },
    });
  });
}

function makeApp(freeze) {
  return function App() {
    const data = createMemo(() => {
      const p = sleep(10).then(() => "ready");
      // e.g. an immutability layer / cache that freezes the objects it hands out:
      return freeze ? Object.freeze(p) : p;
    });
    return (
      <div>
        <Loading fallback={<i>loading…</i>}>
          <p>{data()}</p>
        </Loading>
      </div>
    );
  };
}

const rejections = [];
process.on("unhandledRejection", (err) => rejections.push(err));

const control = await streamEnds(() => {
  const App = makeApp(false);
  return <App />;
}, 2000);
console.log("CONTROL:", control);

const repro = await streamEnds(() => {
  const App = makeApp(true);
  return <App />;
}, 2000);
console.log("REPRO:  ", repro);

await sleep(50);
console.log("unhandled rejections:", rejections.map(String));

const controlEnded = control.startsWith("ENDED");
const reproEnded = repro.startsWith("ENDED");
console.log(
  "\n=== frozen promise streams to completion? (server) ===",
);
if (controlEnded && reproEnded) {
  console.log("PASS — bug is fixed (frozen promise streamed to completion)");
} else {
  console.log(
    `FAIL — bug reproduced: stream hung (${repro}); control ${controlEnded ? "ended normally" : "also failed"}`,
  );
}

// The hung deferred + timers keep the event loop alive — exit explicitly so the
// script terminates instead of hanging forever.
process.exit(0);
