import { createEffect, createSignal, flush, mapArray, onCleanup, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [rows, setRows] = createSignal<number[]>([]);
  const [verdict, setVerdict] = createSignal<Verdict>();
  let created = 0;
  const disposed: number[] = [];

  // Virtualized-table style mapping: the fallback intentionally renders nothing.
  const mapped = mapArray(rows, x => x, {
    fallback: () => {
      const id = created++;
      onCleanup(() => disposed.push(id));
      return null; // falsy fallback
    }
  });
  createEffect(mapped, () => {});

  function pollThenLoad() {
    // two more empty updates (fresh [] identity each) — should keep the ONE
    // fallback owner created on mount
    setRows([]);
    flush();
    setRows([]);
    flush();
    const createdWhileEmpty = created; // expected 1

    // now go non-empty: every fallback owner created must be disposed
    setRows([1]);
    flush();
    const leaked = created - disposed.length;

    setVerdict({
      ok: createdWhileEmpty === 1 && leaked === 0,
      actual: `fallback created ${createdWhileEmpty}× while empty, ${leaked} owner(s) leaked after non-empty`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>mapArray falsy fallback recreated and leaked</h2>
      <p>rows: {JSON.stringify(rows())}</p>
      <button onClick={pollThenLoad}>poll twice, then load a row</button>
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
            <p>Expected the fallback created once while empty and 0 owners leaked.</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
