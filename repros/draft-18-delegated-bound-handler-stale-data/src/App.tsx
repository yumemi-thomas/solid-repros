import { createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [viewing, setViewing] = createSignal("");
  const [editing, setEditing] = createSignal(false);
  const [verdict, setVerdict] = createSignal<Verdict>();

  // Bound handler used while the row is in view mode.
  function openRow(data: { id: number }, e: Event) {
    setViewing(`openRow(${JSON.stringify(data)}, ${e instanceof Event ? "Event" : String(e)})`);
  }

  // Plain handler installed after the swap — it should receive just the event.
  function handleEditorClick(...args: unknown[]) {
    const first = args[0];
    setVerdict({
      ok: args.length === 1 && first instanceof Event,
      actual: `handleEditorClick received ${args.length} arg(s); first = ${
        first instanceof Event ? "Event" : JSON.stringify(first)
      }`
    });
  }

  // The row's props are spread onto the button; the delegated onClick starts in bound form.
  const [rowProps, setRowProps] = createSignal<any>({ onClick: [openRow, { id: 1 }] });

  function enterEditMode() {
    setRowProps({ onClick: handleEditorClick }); // reactively swap bound → plain
    flush();
    setEditing(true);
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Delegated bound handler leaks its data to a later plain handler</h2>
      <button {...rowProps()}>Open row</button>{" "}
      <button onClick={enterEditMode} disabled={editing()}>
        enter edit mode
      </button>
      <p>{viewing()}</p>
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
            <div>expected: handleEditorClick received 1 arg(s); first = Event</div>
            <pre>actual: {v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
