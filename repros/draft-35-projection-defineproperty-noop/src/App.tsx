import { createProjection, createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  // The defineProperty result and the draft read are recorded into these
  // variables inside the compute callback and asserted after flush().
  let reportedSuccess: boolean | undefined;
  let draftAdded: number | undefined;

  const projected = createProjection(
    (draft: { added?: number }) => {
      reportedSuccess = Reflect.defineProperty(draft, "added", {
        value: 2,
        enumerable: true,
        configurable: true,
        writable: true
      });
      draftAdded = draft.added;
    },
    {} as { added?: number }
  );

  const [verdict, setVerdict] = createSignal<Verdict>();

  function defineOnDraft() {
    void projected.added; // projections are lazy — read once so the compute runs
    flush();

    const has = "added" in projected;
    setVerdict({
      ok: reportedSuccess === true && draftAdded === 2 && has && projected.added === 2,
      actual: [
        `Reflect.defineProperty(draft, "added", ...) returned: ${reportedSuccess} (expected true)`,
        `draft.added read inside the compute: ${draftAdded} (expected 2)`,
        `"added" in projected: ${has} (expected true)`,
        `projected.added: ${projected.added} (expected 2)`
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>defineProperty on a projection draft</h2>
      <button onClick={defineOnDraft}>defineProperty on the projection draft</button>
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
