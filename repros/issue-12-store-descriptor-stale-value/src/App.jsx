// getOwnPropertyDescriptor(store, key).value reports the stale pre-write value
// after a plain setStore write, while the proxy read is correct — permanently.
// — Solid 2.0.0-beta.15. Click "increment" to see the verdict.
// Issue draft: issue-drafts/12-descriptor-stale-value.md
import { createSignal, createStore, flush, Show } from "solid-js";

export default function App() {
  const [store, setStore] = createStore({ count: 1 });
  const [verdict, setVerdict] = createSignal();

  function increment() {
    setStore((draft) => {
      draft.count++;
    });
    flush();

    const value = store.count;
    const descriptorValue = Object.getOwnPropertyDescriptor(store, "count")?.value;

    setVerdict({
      ok: descriptorValue === value,
      actual: `store.count = ${value}; descriptor.value = ${descriptorValue}`,
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Store descriptor stale value</h2>
      <p>count: {store.count}</p>
      <button onClick={increment}>increment</button>
      <Show when={verdict()}>
        {(v) => (
          <section
            style={{
              padding: "12px",
              "margin-top": "12px",
              color: "white",
              background: v().ok ? "#137333" : "#c5221f",
            }}
          >
            <b>{v().ok ? "PASS - bug is fixed" : "FAIL - bug reproduced"}</b>
            <p>Expected descriptor.value to match store.count after setStore.</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
