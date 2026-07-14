import { createEffect, createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [route, setRoute] = createSignal(0);
  const [verdict, setVerdict] = createSignal<Verdict>();
  const log: number[] = [];

  // Buggy effect: throws once when it sees the new route.
  createEffect(route, v => {
    if (v === 1) throw new Error("boom");
  });
  // Unrelated sibling effect queued in the same flush.
  createEffect(route, v => {
    log.push(v);
  });

  function navigate() {
    setRoute(1);
    try {
      flush();
    } catch {
      // the unhandled effect error is expected to propagate out of flush()
    }
    const ok = log.length === 2 && log[1] === 1;
    setVerdict({
      ok,
      actual: `log = [${log.join(", ")}]${ok ? "" : " — sibling update dropped"}`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Throwing effect drops sibling effects</h2>
      <p>
        A throw in one effect should not drop other effects' updates queued in the same flush.
      </p>
      <button onClick={navigate}>navigate</button>
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
            <p>Expected the sibling effect to still observe v === 1 (log = [0, 1]).</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
