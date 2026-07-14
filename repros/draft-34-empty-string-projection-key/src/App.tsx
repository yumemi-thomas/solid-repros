import { createProjection, createSignal, flush, Show } from "solid-js";

type Row = { "": string; value: number };
type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [rows, setRows] = createSignal<Row[]>([
    { "": "a", value: 1 },
    { "": "b", value: 2 }
  ]);

  // Return-value projection form: the callback returns the next array and Solid
  // reconciles it into the projection store by the `key` property (here `""`),
  // so row proxies keep their identity across reorders.
  const projected = createProjection<Row[]>(() => rows(), [], { key: "" });

  const [verdict, setVerdict] = createSignal<Verdict>();

  function reorderRows() {
    flush();
    const previousA = projected[0]; // proxy for the row whose "" key is "a"
    const previousB = projected[1]; // proxy for the row whose "" key is "b"

    setRows([
      { "": "b", value: 20 },
      { "": "a", value: 10 }
    ]);
    flush();

    const identity = (row: Row) =>
      row === previousA
        ? 'the old row-"a" proxy (reused positionally — key "" was ignored)'
        : row === previousB
          ? 'the old row-"b" proxy'
          : "a fresh proxy";

    setVerdict({
      // identity should follow key "": projected[0] is now the row keyed "b"
      ok: projected[0] === previousB && projected[1] === previousA,
      actual: [
        `projected[0] (now the row keyed "b", value 20): ${identity(projected[0])} — expected the old row-"b" proxy`,
        `projected[1] (now the row keyed "a", value 10): ${identity(projected[1])} — expected the old row-"a" proxy`
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Empty-string projection key</h2>
      <p>rows: {JSON.stringify(rows())}</p>
      <button onClick={reorderRows}>reorder rows</button>
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
