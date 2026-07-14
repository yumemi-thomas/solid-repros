import { createMemo, createSignal, createStore, flush, reconcile, Show } from "solid-js";

type CaseResult = { label: string; ok: boolean; expected: string; actual: string };
type Verdict = { ok: boolean; report: string };

const show = (v: unknown) => (typeof v === "string" ? JSON.stringify(v) : String(v));

export default function App() {
  const [list, setList] = createStore<any>(Object.assign([1], { label: "old" }));

  // Tracked observers (memos) alongside direct proxy reads: the bug is that
  // different observation paths disagree after reconciliation. Rendering them
  // below primes both memos on the pre-reconcile values.
  const label = createMemo(() => list.label);
  const keys = createMemo(() => Object.keys(list).join(","));

  const [verdict, setVerdict] = createSignal<Verdict>();

  function syncFromServer() {
    const next: any = Object.assign([1], { label: "new", extra: "added" });
    // reconcile() requires a key argument; these rows are primitive numbers
    // with no `id` property, so the key never matches and reconciliation is
    // positional.
    setList(reconcile(next, "id"));
    flush();

    const cases: CaseResult[] = [
      // The split-brain pair: memo read vs direct read of the same property.
      {
        label: "label() — memo over list.label",
        ok: label() === "new",
        expected: '"new"',
        actual: show(label())
      },
      {
        label: "list.label — direct proxy read",
        ok: list.label === "new",
        expected: '"new"',
        actual: show(list.label)
      },
      {
        label: "keys() — memo over Object.keys(list)",
        ok: keys() === "0,label,extra",
        expected: '"0,label,extra"',
        actual: show(keys())
      },
      {
        label: "Object.keys(list) — direct enumeration",
        ok: Object.keys(list).join(",") === "0,label,extra",
        expected: '"0,label,extra"',
        actual: show(Object.keys(list).join(","))
      },
      {
        label: "list.extra — direct proxy read (no stale node existed)",
        ok: list.extra === "added",
        expected: '"added"',
        actual: show(list.extra)
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
      <h2>reconcile() vs array metadata</h2>
      <p>
        memo label: {String(label())} · memo keys: {keys()}
      </p>
      <button onClick={syncFromServer}>sync from server</button>
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
