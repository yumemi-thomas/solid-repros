import { createRoot, createStore, flush, sharedConfig } from "solid-js";

let hydrationData: Record<string, any> = {};
function startHydration(data: Record<string, any>) {
  hydrationData = data;
  sharedConfig.hydrating = true;
  (sharedConfig as any).has = (id: string) => id in hydrationData;
  (sharedConfig as any).load = (id: string) => hydrationData[id];
  (sharedConfig as any).gather = () => {};
}
function stopHydration() {
  sharedConfig.hydrating = false;
  (sharedConfig as any).has = undefined;
  (sharedConfig as any).load = undefined;
  (sharedConfig as any).gather = undefined;
}

// Server serialized the store as { name: "server" }.
startHydration({ t0: { v: { name: "server" }, s: 1 } });

let store: any;
createRoot(() => {
  [store] = createStore(
    draft => {
      draft.name = "client"; // synchronous client synchronizer
    },
    { name: "initial" },
    { ssrSource: "hybrid" }
  );
}, { id: "t" });
flush();
console.log(
  "hydrating store adopts server value:",
  store.name === "server" ? "PASS" : `FAIL — expected "server", got ${JSON.stringify(store.name)}`
);

stopHydration();
flush();
console.log(
  "post-hydration sync draft write applied:",
  store.name === "client" ? "PASS" : `FAIL — expected "client", got ${JSON.stringify(store.name)}`
);
