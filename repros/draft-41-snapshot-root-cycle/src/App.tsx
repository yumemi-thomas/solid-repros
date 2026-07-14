import { createSignal, createStore, flush, Show, snapshot } from "solid-js";

type CaseResult = { label: string; ok: boolean; expected: string; actual: string };
type Verdict = { ok: boolean; report: string };

export default function App() {
  const source: any = { value: 1 };
  source.self = source; // root self-reference

  const [state, setState] = createStore<any>(source);
  const [verdict, setVerdict] = createSignal<Verdict>();

  function writeAndSnapshot() {
    setState(draft => {
      draft.value = 2;
    });
    flush();

    const copy: any = snapshot(state);

    const cases: CaseResult[] = [
      {
        label: "copy.value",
        ok: copy.value === 2,
        expected: "2",
        actual: String(copy.value) // passes — values look right...
      },
      {
        label: "copy.self.value",
        ok: copy.self.value === 2,
        expected: "2",
        actual: String(copy.self.value) // passes — ...so deep value checks miss the corruption
      },
      {
        label: "copy.self === copy",
        ok: copy.self === copy,
        expected: "true (the root self-reference points back at the returned root)",
        actual: String(copy.self === copy) // fails — the cycle closes around a second clone
      },
      {
        label: "copy.self.self === copy.self",
        ok: copy.self.self === copy.self,
        expected: "true",
        actual: String(copy.self.self === copy.self) // passes — the second clone is itself self-cyclic
      }
    ];

    setVerdict({
      ok: cases.every(c => c.ok),
      report: cases
        .map(
          c =>
            `${c.ok ? "PASS" : "FAIL"}  ${c.label}\n  expected: ${c.expected}\n  actual:   ${c.actual}`
        )
        .join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>snapshot() root self-cycle identity</h2>
      <p>value: {state.value}</p>
      <button onClick={writeAndSnapshot}>write and snapshot</button>
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
            <pre>{v().report}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
