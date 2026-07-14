import { createRenderEffect, createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  // The initial fetch is still in flight (a promise that never resolves).
  const inFlightFetch = new Promise<string>(() => {});
  // Writable async memo: loads the draft, but the user may type immediately.
  const [draft, setDraft] = createSignal<string>(() => inFlightFetch);
  const [verdict, setVerdict] = createSignal<Verdict>();

  // Probe what downstream consumers actually see (pending reads throw).
  let visible = "(never ran)";
  createRenderEffect(
    () => {
      try {
        visible = draft();
      } catch {
        visible = "(pending)";
      }
    },
    () => {}
  );

  async function typeWhileLoading() {
    // Per the writable-memo "manual value wins" contract, this synchronous
    // write must become the visible value even though a fetch is in flight.
    setDraft("edited by user");
    flush();
    await Promise.resolve();
    flush();

    setVerdict({
      ok: visible === "edited by user",
      actual: `wrote "edited by user"; the render effect sees "${visible}"`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Manual set() during an in-flight fetch</h2>
      <p>
        A manual set() while the fetch is pending should immediately become the visible value
        ("the manual value wins").
      </p>
      <button onClick={typeWhileLoading}>type while loading</button>
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
            <p>Expected the written value to be the visible value.</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
