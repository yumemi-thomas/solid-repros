import { createEffect, createMemo, createSignal, flush, Show, untrack } from "solid-js";

type Verdict = { ok: boolean; actual: string };

class Boom extends Error {}

export default function App() {
  const [permission, setPermission] = createSignal(1); // 1 = allowed, 2 = denied
  const [verdict, setVerdict] = createSignal<Verdict>();
  const values: string[] = [];
  const errors: unknown[] = [];

  const label = createMemo(() => {
    if (permission() === 2) throw new Boom("boom");
    return "Anonymous"; // always the same good value
  });
  const chained = createMemo(() => label()); // downstream memo for the untracked-read probe
  createEffect(chained, { effect: () => {}, error: () => {} }); // keep it live
  createEffect(label, {
    effect: v => {
      values.push(v);
    },
    error: err => {
      errors.push(err);
    }
  });

  async function denyThenRestore() {
    setPermission(2); // memo throws → error observed downstream
    flush();
    setPermission(1); // memo heals to "Anonymous" — equal to its last good value
    flush();
    await Promise.resolve();
    flush();

    // untracked read of the chained (downstream) memo after the heal:
    // it should return "Anonymous" but keeps throwing the stale error
    let untrackedError: unknown = null;
    try {
      untrack(chained);
    } catch (err) {
      untrackedError = err;
    }

    const effectRecovered = values.length === 2 && values[1] === "Anonymous";
    setVerdict({
      ok: effectRecovered && untrackedError === null,
      actual: [
        `values = [${values.map(v => JSON.stringify(v)).join(", ")}], errors observed = ${errors.length}` +
          (effectRecovered ? "" : " (effect never recovered from the error)"),
        untrackedError !== null
          ? `untracked chained read still throws: ${String(untrackedError)}`
          : "untracked chained read returned normally"
      ].join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Error heal to an equal value</h2>
      <p>
        When an errored memo recomputes back to a value equal to its last good value, downstream
        consumers should observe the recovery.
      </p>
      <button onClick={denyThenRestore}>deny then restore permission</button>
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
            <p>Expected the effect to re-run on heal and the chained memo to stop throwing.</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
