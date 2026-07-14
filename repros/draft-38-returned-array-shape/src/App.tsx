import { createSignal, createStore, flush, Show } from "solid-js";

type CaseResult = { label: string; ok: boolean; expected: string; actual: string };
type Verdict = { ok: boolean; report: string };

const show = (v: unknown) => (typeof v === "string" ? JSON.stringify(v) : String(v));

export default function App() {
  // Manifestation 1: replaced by a sparse array (holes should stay holes).
  const [list, setList] = createStore<number[]>([1, 2]);

  // Manifestation 2: an array carrying named and symbol metadata.
  const meta = Symbol("meta");
  const [tagged, setTagged] = createStore<any>(
    Object.assign([1], { label: "old", [meta]: "old-symbol" })
  );

  const [verdict, setVerdict] = createSignal<Verdict>();

  function replaceFromPayload() {
    // Sparse replacement: [ <hole>, 2 ]
    const next = new Array<number>(2);
    next[1] = 2;
    setList(() => next);
    flush();

    // Metadata replacement: changed label, added key, changed symbol value.
    const next2: any = Object.assign([2], {
      label: "new",
      extra: "added",
      [meta]: "new-symbol"
    });
    setTagged(() => next2);
    flush();

    const cases: CaseResult[] = [
      {
        label: "0 in list",
        ok: !(0 in list),
        expected: "false (hole preserved)",
        actual: String(0 in list)
      },
      {
        label: "Object.keys(list)",
        ok: JSON.stringify(Object.keys(list)) === '["1"]',
        expected: '["1"]',
        actual: JSON.stringify(Object.keys(list))
      },
      {
        label: "tagged.label",
        ok: tagged.label === "new",
        expected: '"new"',
        actual: show(tagged.label)
      },
      {
        label: "tagged.extra",
        ok: tagged.extra === "added",
        expected: '"added"',
        actual: show(tagged.extra)
      },
      {
        label: "tagged[meta]",
        ok: tagged[meta] === "new-symbol",
        expected: '"new-symbol"',
        actual: show(tagged[meta])
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
      <h2>Returned-array replacement shape</h2>
      <p>
        items: {JSON.stringify([...list])} · label: {String(tagged.label)}
      </p>
      <button onClick={replaceFromPayload}>replace lists from payload</button>
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
