import { createProjection, createSignal, createStore, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [verdict, setVerdict] = createSignal<Verdict>();

  // createProjection draft (buggy): results are recorded inside the compute
  // callback and asserted after flush().
  let same: boolean | undefined;
  let includes: boolean | undefined;
  let index: number | undefined;
  const projected = createProjection((draft: { id: number }[]) => {
    same = draft[0] === draft[0];        // expected true
    includes = draft.includes(draft[0]); // expected true
    index = draft.indexOf(draft[0]);     // expected 0
  }, [{ id: 1 }]);

  // plain store draft (control: behaves correctly)
  let sSame: boolean | undefined;
  let sIncludes: boolean | undefined;
  let sIndex: number | undefined;
  const [, setList] = createStore([{ id: 1 }]);

  function runChecks() {
    void projected[0]; // projections are lazy — read once so the compute runs
    flush();

    setList(draft => {
      sSame = draft[0] === draft[0];
      sIncludes = draft.includes(draft[0]);
      sIndex = draft.indexOf(draft[0]);
    });
    flush();

    setVerdict({
      ok:
        same === true &&
        includes === true &&
        index === 0 &&
        sSame === true &&
        sIncludes === true &&
        sIndex === 0,
      actual: [
        `projection: draft[0] === draft[0] -> ${same} (expected true)`,
        `projection: draft.includes(draft[0]) -> ${includes} (expected true)`,
        `projection: draft.indexOf(draft[0]) -> ${index} (expected 0)`,
        `plain store control: draft[0] === draft[0] -> ${sSame} (expected true)`,
        `plain store control: draft.includes(draft[0]) -> ${sIncludes} (expected true)`,
        `plain store control: draft.indexOf(draft[0]) -> ${sIndex} (expected 0)`
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Projection draft identity</h2>
      <button onClick={runChecks}>run draft identity checks</button>
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
