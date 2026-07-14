import { createSignal, createStore, flush, Show, snapshot } from "solid-js";

const cacheMeta = Symbol("cacheMeta");

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [invoice, setInvoice] = createStore({ total: 100, [cacheMeta]: "etag-v1" } as any);
  const [verdict, setVerdict] = createSignal<Verdict>();

  function editAndSnapshot() {
    // control: before any write, snapshot() returns the original object and
    // the symbol survives (identity return path).
    const before = snapshot(invoice) as any;

    setInvoice((draft: any) => {
      draft.total = 125;
    });
    flush();

    const after = snapshot(invoice) as any;
    setVerdict({
      ok: after[cacheMeta] === "etag-v1",
      actual: [
        `before write: total=${before.total}, [cacheMeta]=${String(before[cacheMeta])}`,
        `after write:  total=${after.total}, [cacheMeta]=${String(after[cacheMeta])}`
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>snapshot() drops symbol keys after a write</h2>
      <p>total: {invoice.total}</p>
      <button onClick={editAndSnapshot}>edit total and snapshot</button>
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
