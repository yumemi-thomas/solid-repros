import { createEffect, createMemo, createSignal, flush, onCleanup, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [filter, setFilter] = createSignal(0);
  const [aligned, setAligned] = createSignal(0, { ownedWrite: true });
  const [verdict, setVerdict] = createSignal<Verdict>();
  const cleanups: string[] = [];
  let runN = 0;

  // The feed: every run registers teardown for its subscription.
  const feed = createMemo(() => {
    filter();
    aligned();
    const id = runN++;
    onCleanup(() => cleanups.push(`run${id}`));
    return id;
  });
  // Higher computation that writes the ownedWrite signal during the flush,
  // re-dirtying `feed` after it already recomputed once in the same flush.
  const coordinator = createMemo(() => {
    feed();
    setAligned(filter());
    return filter();
  });
  createEffect(
    () => (feed(), coordinator()),
    () => {}
  );

  function changeFilter() {
    setFilter(1);
    flush();
    // feed ran twice inside this flush (run1 before the coordinator wrote the
    // ownedWrite signal, run2 after). Both superseded runs (run0 from mount
    // and run1) must have been cleaned up.
    const fired = cleanups.slice().sort().join(",");
    const missing = ["run0", "run1"].filter(id => !cleanups.includes(id));
    setVerdict({
      ok: fired === "run0,run1",
      actual: `superseded cleanups fired: [${fired}]${
        missing.length ? ` — ${missing.join(", ")} lost, onCleanup never ran` : ""
      }`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Superseded memo run's onCleanup never fires</h2>
      <p>current feed run: {feed()}</p>
      <button onClick={changeFilter}>change filter</button>
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
            <p>Expected both superseded runs' cleanups to fire: [run0,run1].</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
