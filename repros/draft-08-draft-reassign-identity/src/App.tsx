import { createSignal, createStore, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [state, setState] = createStore({
    list: [
      { id: 1, v: "a" },
      { id: 2, v: "b" }
    ]
  });
  const [verdict, setVerdict] = createSignal<Verdict>();

  function editThenSwap() {
    // edit row 1 so it carries an override
    setState(s => {
      s.list[1].v = "b1";
    });
    flush();
    const captured = state.list[1]; // e.g. the row proxy handed to a component

    // canonical in-place swap of rows 0 and 1
    setState(s => {
      const tmp = s.list[1];
      s.list[1] = s.list[0];
      s.list[0] = tmp;
    });
    flush();

    // the edited row, now at index 0, should be the same proxy captured before the swap
    const identityPreserved = state.list[0] === captured;

    // write through the store to the logical row now at index 0
    setState(s => {
      s.list[0].v = "b2";
    });
    flush();

    setVerdict({
      ok: identityPreserved && captured.v === "b2",
      actual: [
        `state.list[0] === captured: ${identityPreserved} (expected true — the swap moves the same proxy)`,
        `store row v: "${state.list[0].v}"; captured proxy v: "${captured.v}" (expected "b2" on both)`
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Row swap detaches an edited row's proxy</h2>
      <p>rows: {JSON.stringify(state.list)}</p>
      <button onClick={editThenSwap}>edit row 1, swap rows, write to moved row</button>
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
