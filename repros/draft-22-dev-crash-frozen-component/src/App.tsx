import { createSignal, Show } from "solid-js";
import { Dynamic, render } from "@solidjs/web";

type Verdict = { ok: boolean; actual: string };

// A plugin system freezes its exported widgets so plugins cannot
// monkey-patch each other.
const PaymentWidget = Object.freeze((props: { label: string }) => <span>{props.label}</span>);

export default function App() {
  const [verdict, setVerdict] = createSignal<Verdict>();

  function attempt(mount: (el: HTMLElement) => () => void) {
    const el = document.createElement("div");
    try {
      const dispose = mount(el);
      const text = el.textContent ?? "";
      dispose();
      return `rendered ${JSON.stringify(text)}`;
    } catch (e: any) {
      return `${e?.name ?? "Error"}: ${e?.message ?? String(e)}`;
    }
  }

  function mountFrozenWidget() {
    const cases = [
      {
        label: "<Dynamic component={PaymentWidget}>",
        result: attempt(el =>
          render(() => <Dynamic component={PaymentWidget} label="Pay now" />, el)
        )
      },
      {
        label: "direct JSX <PaymentWidget />",
        result: attempt(el => render(() => <PaymentWidget label="Pay now" />, el))
      }
    ];
    setVerdict({
      ok: cases.every(c => c.result === 'rendered "Pay now"'),
      actual: cases.map(c => `${c.label}: ${c.result}`).join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Rendering a frozen component function (dev build)</h2>
      <button onClick={mountFrozenWidget}>mount frozen widget</button>
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
            <p>Expected both cases to render "Pay now".</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
