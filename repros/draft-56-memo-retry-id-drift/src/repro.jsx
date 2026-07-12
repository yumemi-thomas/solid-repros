// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// Async server createMemo retry APPENDS hydration child-id slots instead of
// resetting. On the client every memo recompute disposes the previous run's
// children and resets the owner's child-id counter, so ids allocated inside the
// compute always restart at slot 0. The server's non-sync createMemo does
// neither: when the compute reads a pending async source and throws
// NotReadyError, the retry re-runs under the same owner with the previous run's
// children still attached and _childCount untouched — so each retry appends a
// fresh child-id slot. A memo body that allocates hydration ids (here via
// createUniqueId) therefore emits a DRIFTED id into the SSR output that the
// client (which re-runs from slot 0) will never agree with.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/56-memo-retry-id-drift.md
import { renderToStream } from "@solidjs/web";
import { createMemo, createUniqueId, Loading } from "solid-js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function collectChunks(code) {
  return new Promise((resolvep) => {
    const chunks = [];
    renderToStream(code).pipe({
      write(chunk) {
        chunks.push(chunk);
      },
      end() {
        resolvep(chunks);
      },
    });
  });
}

async function run(label, asyncSource) {
  const fieldIds = [];
  function App() {
    const user = asyncSource
      ? createMemo(async () => {
          await sleep(10);
          return "Alice";
        })
      : () => "Alice";
    const card = createMemo(() => {
      const fieldId = createUniqueId(); // consumes one child-id slot per run
      fieldIds.push(fieldId);
      return `${user()} / field:${fieldId}`;
    });
    return (
      <div>
        <Loading fallback={<i>loading…</i>}>
          <p>{card()}</p>
        </Loading>
      </div>
    );
  }
  const html = (await collectChunks(() => <App />)).join("");
  // The client resets the child-id counter on every recompute, so all runs
  // must consume the same slot.
  const ok = new Set(fieldIds).size === 1;
  console.log(`${label}: ${ok ? "PASS" : "FAIL"}`);
  console.log(`  child ids consumed per compute run: ${JSON.stringify(fieldIds)}`);
  console.log(`  HTML shows: ${html.match(/field:\d+/)?.[0]}`);
  return ok;
}

console.log(
  "=== async server memo retry appends child-id slots -> server/client id drift (server-only) ==="
);

const control = await run("CONTROL — sync source", false);
const repro = await run("REPRO — pending async source", true);
console.log(
  control && repro
    ? "\nPASS — retry re-ran from slot 0"
    : "\nFAIL — NotReady retry appended a fresh child-id slot (the client re-runs from slot 0)"
);
