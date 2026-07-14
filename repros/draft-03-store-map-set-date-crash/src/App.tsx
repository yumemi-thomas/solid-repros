import { createSignal, createStore, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [store, setStore] = createStore({
    usersById: new Map([["u1", "Ada"]]),
    selectedIds: new Set(["u1", "u2"]),
    trialEndsAt: new Date(2020, 0, 1)
  });
  const [verdict, setVerdict] = createSignal<Verdict>();

  function runAllProbes() {
    const cases: Array<{ label: string; run: () => boolean }> = [
      // 1. READ path: internal-slot accessors invoked with the proxy as receiver.
      { label: "read  usersById.size (expect 1)", run: () => store.usersById.size === 1 },
      { label: "read  selectedIds.size (expect 2)", run: () => store.selectedIds.size === 2 },
      // 2. WRITE path: built-in methods returned unbound inside the setter draft.
      {
        label: 'write usersById.set("u2", "Grace")',
        run: () => {
          setStore(s => {
            s.usersById.set("u2", "Grace");
          });
          flush();
          return store.usersById.get("u2") === "Grace";
        }
      },
      {
        label: 'write selectedIds.add("u3")',
        run: () => {
          setStore(s => {
            s.selectedIds.add("u3");
          });
          flush();
          return store.selectedIds.has("u3");
        }
      },
      {
        label: "write trialEndsAt.setFullYear(2021)",
        run: () => {
          setStore(s => {
            s.trialEndsAt.setFullYear(2021);
          });
          flush();
          return store.trialEndsAt.getFullYear() === 2021;
        }
      },
      // Controls: generic prototype methods work today (the read path binds them).
      { label: 'control usersById.get("u1")', run: () => store.usersById.get("u1") === "Ada" },
      { label: "control trialEndsAt.getTime()", run: () => Number.isFinite(store.trialEndsAt.getTime()) }
    ];

    const lines = cases.map(c => {
      try {
        return `${c.label}: ${c.run() ? "ok" : "wrong value"}`;
      } catch (e) {
        return `${c.label}: threw ${String(e)}`;
      }
    });
    setVerdict({ ok: lines.every(line => line.endsWith(": ok")), actual: lines.join("\n") });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Map/Set/Date values in a store</h2>
      <p>cached user u1: {store.usersById.get("u1")} (generic Map.get — the read that still works)</p>
      <button onClick={runAllProbes}>run Map/Set/Date probes</button>
      <Show when={verdict()}>
        {v => (
          <section
            style={{
              padding: "12px",
              "margin-top": "12px",
              color: "white",
              background: v().ok ? "#137333" : "#c5221f"
            }}
          >
            <b>{v().ok ? "PASS - bug is fixed" : "FAIL - bug reproduced"}</b>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
