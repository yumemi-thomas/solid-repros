import { createEffect, createSignal, createStore, flush, reconcile, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [task, setTask] = createStore({ title: "Ship beta", updatedAt: new Date(2020, 0, 1) });
  const [verdict, setVerdict] = createSignal<Verdict>();

  let effectRuns = 0;
  createEffect(
    () => task.updatedAt.getTime(),
    () => {
      effectRuns++;
    }
  );

  function syncFromServer() {
    // reconcile a server payload whose only change is the Date leaf.
    // (reconcile's key argument is required by its signature; it goes unused
    // here because the changed value is a keyless Date leaf — exactly the bug.)
    setTask(reconcile({ title: "Ship beta", updatedAt: new Date(2021, 5, 5) }, "id"));
    flush();

    const rawYear = task.updatedAt.getFullYear(); // the raw value DID update -> 2021
    setVerdict({
      ok: effectRuns === 2,
      actual: `store value updated to ${rawYear}; tracking effect ran ${effectRuns}x (expected 2x)`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>reconcile() skips Date/Map/Set leaf changes</h2>
      <p>
        {task.title} — last edited: {task.updatedAt.toDateString()}
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
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
