import { createSignal, createStore, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [item, setItem] = createStore({
    _qty: 1,
    get qty(): number {
      return this._qty;
    },
    set qty(v: number) {
      this._qty = v;
    }
  });
  const [verdict, setVerdict] = createSignal<Verdict>();

  function runBothWrites() {
    // 1. write through the accessor — the setter should run and update _qty
    setItem(s => {
      s.qty = 5;
    });
    flush();
    const backingAfterAccessorWrite = item._qty; // expected 5; actual 1

    // 2. write the backing field directly — a live getter must reflect it
    setItem(s => {
      s._qty = 9;
    });
    flush();
    const getterValue = item.qty; // expected 9; actual 5 (override shadows the getter)

    const setterOk = backingAfterAccessorWrite === 5;
    const getterOk = getterValue === 9;
    setVerdict({
      ok: setterOk && getterOk,
      actual: [
        `setter (2.0 regression): after qty = 5, backing _qty === ${backingAfterAccessorWrite} (expected 5)${setterOk ? "" : " — setter never ran"}`,
        `getter (long-standing):  after _qty = 9, qty === ${getterValue} (expected 9)${getterOk ? "" : " — getter shadowed by the override"}`
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Own accessor setter bypassed, getter killed</h2>
      <p>qty: {item.qty}</p>
      <button onClick={runBothWrites}>write qty = 5, then _qty = 9</button>
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
