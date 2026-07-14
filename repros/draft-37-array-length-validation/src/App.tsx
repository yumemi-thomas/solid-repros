import { createSignal, createStore, flush, Show, snapshot } from "solid-js";

type CaseResult = { label: string; ok: boolean; expected: string; actual: string };
type Verdict = { ok: boolean; report: string };

export default function App() {
  const [verdict, setVerdict] = createSignal<Verdict>();

  function runLengthWrites() {
    const cases: CaseResult[] = [];

    // Cases 1 and 2: invalid lengths -1 and 1.5 — native arrays (and
    // Solid 1.9.14) throw RangeError and leave the array untouched.
    for (const bad of [-1, 1.5]) {
      const [list, setList] = createStore(["milk", "eggs", "bread"]);
      let threw: string | null = null;
      try {
        setList(draft => {
          (draft as any).length = bad;
        });
        flush();
      } catch (e) {
        threw = e instanceof RangeError ? "RangeError" : String(e);
      }
      cases.push({
        label: `list.length = ${bad}`,
        ok: threw === "RangeError",
        expected: "throws RangeError (native ArraySetLength semantics)",
        actual: threw ?? `accepted — list.length is now ${list.length}`
      });
    }

    // Case 3: numeric string "2" — native arrays coerce it to the number 2.
    {
      const [list, setList] = createStore(["milk", "eggs", "bread"]);
      setList(draft => {
        (draft as any).length = "2";
      });
      flush();
      cases.push({
        label: 'list.length = "2"',
        ok: (list.length as any) === 2,
        expected: "number 2 (coerced)",
        actual: `${typeof list.length} ${JSON.stringify(list.length)}`
      });
    }

    // Case 4 (follow-on): after the invalid `-1` write is accepted,
    // snapshot(list) throws RangeError far away from the bad write.
    {
      const [list, setList] = createStore(["milk", "eggs", "bread"]);
      try {
        setList(draft => {
          (draft as any).length = -1;
        });
        flush();
      } catch {
        // if the write correctly throws, snapshot below sees a valid array
      }
      let snapThrew: string | null = null;
      try {
        snapshot(list);
      } catch (e) {
        snapThrew = String(e);
      }
      cases.push({
        label: "snapshot(list) after length = -1",
        ok: snapThrew === null,
        expected: "does not throw (the invalid length was rejected at the write)",
        actual: snapThrew ? `throws ${snapThrew}` : "did not throw"
      });
    }

    setVerdict({
      ok: cases.every(c => c.ok),
      report: cases
        .map(c => `${c.ok ? "PASS" : "FAIL"}  ${c.label}\n  expected: ${c.expected}\n  actual:   ${c.actual}`)
        .join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Store array length: validation and coercion</h2>
      <button onClick={runLengthWrites}>run length writes</button>
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
