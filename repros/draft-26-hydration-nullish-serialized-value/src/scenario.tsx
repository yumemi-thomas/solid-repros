import { createMemo, createRoot, flush, sharedConfig } from "solid-js";

let hydrationData: Record<string, any> = {};
function startHydration(data: Record<string, any>) {
  hydrationData = data;
  sharedConfig.hydrating = true;
  (sharedConfig as any).has = (id: string) => id in hydrationData;
  (sharedConfig as any).load = (id: string) => hydrationData[id];
  (sharedConfig as any).gather = () => {};
}

let result: unknown;

// Case 1: resolved async envelope — the server's async memo resolved to null
// ("no active coupon"), serialized as { v: null, s: 1 }.
startHydration({ t0: { v: null, s: 1 } });
createRoot(() => {
  result = createMemo(() => "client")();
}, { id: "t" });
flush();
console.log(
  "memo adopts serialized null:",
  result === null ? "PASS" : `FAIL — expected null, got ${JSON.stringify(result)}`
);

// Case 2: direct serialized null — the value itself was serialized as null.
startHydration({ t0: null });
let calls = 0;
createRoot(() => {
  result = createMemo(() => {
    calls++;
    return "client";
  })();
}, { id: "t" });
flush();
console.log(
  "direct serialized null adopted:",
  result === null ? "PASS" : `FAIL — expected null, got ${JSON.stringify(result)}`
);
console.log(
  "client compute skipped during hydration:",
  calls === 0 ? "PASS" : `FAIL — expected 0 calls, got ${calls}`
);
