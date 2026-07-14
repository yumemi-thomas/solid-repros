import { createSignal, createStore, deep, flush, Show, snapshot } from "solid-js";

type CaseResult = { label: string; ok: boolean; expected: string; actual: string };
type Verdict = { ok: boolean; report: string };

const show = (v: unknown) => (typeof v === "string" ? JSON.stringify(v) : String(v));

export default function App() {
  // Manifestation 1: a sparse array (three slots, only the last present).
  const source = new Array<number>(3); // [ <hole>, <hole>, <hole> ]
  source[2] = 3;
  const [list, setList] = createStore(source);

  // Manifestation 2: an array carrying named and symbol metadata.
  const meta = Symbol("meta");
  const [tagged, setTagged] = createStore<any>(
    Object.assign([1], { label: "keep", [meta]: "keep-symbol" })
  );

  const [verdict, setVerdict] = createSignal<Verdict>();

  function writeAndCopy() {
    // Any write creates an override; the copies go wrong from then on.
    setList(draft => {
      draft[2] = 4;
    });
    flush();

    const copy = snapshot(list);
    // deep() shares the same implementation and should differ from snapshot()
    // only by tracking behavior; called here untracked, it also works — and
    // produces the same (wrong) dense array.
    const deepCopy = deep(list);

    setTagged(draft => {
      draft[0] = 2; // unrelated index write
    });
    flush();

    const copy2: any = snapshot(tagged);

    const cases: CaseResult[] = [
      {
        label: "0 in snapshot(list)",
        ok: !(0 in copy),
        expected: "false (hole preserved)",
        actual: String(0 in copy)
      },
      {
        label: "1 in snapshot(list)",
        ok: !(1 in copy),
        expected: "false (hole preserved)",
        actual: String(1 in copy)
      },
      {
        label: "Object.keys(snapshot(list))",
        ok: JSON.stringify(Object.keys(copy)) === '["2"]',
        expected: '["2"]',
        actual: JSON.stringify(Object.keys(copy))
      },
      {
        label: "0 in deep(list)",
        ok: !(0 in deepCopy),
        expected: "false (hole preserved)",
        actual: String(0 in deepCopy)
      },
      {
        label: "Object.keys(deep(list))",
        ok: JSON.stringify(Object.keys(deepCopy)) === '["2"]',
        expected: '["2"]',
        actual: JSON.stringify(Object.keys(deepCopy))
      },
      {
        label: "snapshot(tagged).label",
        ok: copy2.label === "keep",
        expected: '"keep"',
        actual: show(copy2.label)
      },
      {
        label: "snapshot(tagged)[meta]",
        ok: copy2[meta] === "keep-symbol",
        expected: '"keep-symbol"',
        actual: show(copy2[meta])
      }
    ];

    setVerdict({
      ok: cases.every(c => c.ok),
      report: cases
        .map(c => `${c.ok ? "PASS" : "FAIL"}  ${c.label}\n  expected: ${c.expected}\n  actual:   ${c.actual}`)
        .join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>snapshot()/deep() vs sparse holes and array metadata</h2>
      <p>
        items: {JSON.stringify([...list])} (length: {list.length}) · label: {String(tagged.label)}
      </p>
      <button onClick={writeAndCopy}>write one index and copy</button>
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
