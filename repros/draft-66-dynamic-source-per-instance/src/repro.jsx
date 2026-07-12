// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: dynamic(source) is documented to SHARE one source
// evaluation across all mounted instances (so `const W = dynamic(() => import(…))`
// used in 10 places loads once). The client does this — one lazy cached memo per
// dynamic() call. The SERVER calls source() inside the returned component, once
// PER INSTANCE: N instances → N source() calls, and a non-idempotent source
// renders DIFFERENT components per instance (A|B|A) — a guaranteed hydration
// mismatch. Client renders A|A|A with a single shared evaluation.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/66-dynamic-source-per-instance.md
import { renderToString, renderToStringAsync, dynamic } from "@solidjs/web";
import { Loading } from "solid-js";

function ChartImpl(props) {
  return <figure>chart: {props.region}</figure>;
}

let loads = 0;
const Chart = dynamic(() => {
  loads++; // stands in for import("./Chart") — one module load per call
  return Promise.resolve(ChartImpl);
});

const regions = ["emea", "amer", "apac"];
await renderToStringAsync(() => (
  <Loading fallback={<p>loading charts…</p>}>
    {regions.map((region) => (
      <Chart region={region} />
    ))}
  </Loading>
));
console.log(`source() calls: ${loads} for ${regions.length} instances (docs promise 1)`);

// A non-idempotent source renders a different component per instance:
let flips = 0;
const Slot = dynamic(() => (flips++ % 2 === 0 ? () => <b>A</b> : () => <i>B</i>));
const out = renderToString(() => (
  <>
    <Slot />|<Slot />|<Slot />
  </>
));
console.log("non-idempotent source:", JSON.stringify(out));

// Client (browser build): "source() calls: 1 for 3 instances" and "A|A|A".
console.log(
  "\n=== dynamic() shares one source evaluation across instances? (server) ===",
);
console.log(
  loads === 1
    ? "PASS — bug is fixed (source() evaluated once, shared)"
    : `FAIL — bug reproduced: source() re-evaluated per instance (${loads} calls for ${regions.length} instances)`,
);
