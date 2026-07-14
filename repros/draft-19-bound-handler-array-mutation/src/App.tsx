import { createSignal, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [verdict, setVerdict] = createSignal<Verdict>();
  const hovers: { data: unknown; event: unknown }[] = [];

  // One shared tooltip handler for every toolbar button.
  function showTooltip(data: unknown, event: unknown) {
    hovers.push({ data, event });
    const tupleIntact = tooltipHandler[0] === showTooltip;
    setVerdict({
      ok: tupleIntact && hovers.every(h => h.event instanceof Event),
      actual: [
        ...hovers.map(
          (h, i) =>
            `hover ${i + 1}: showTooltip(${JSON.stringify(h.data)}, ${
              h.event instanceof Event ? "Event" : JSON.stringify(h.event)
            })`
        ),
        `tooltipHandler[0] === showTooltip: ${tupleIntact}`
      ].join("\n")
    });
  }

  // One tuple reused across elements to avoid allocating a new array per button
  // (mouseenter is a NON-delegated event).
  const tooltipHandler = [showTooltip, { placement: "top" }] as any;

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Shared non-delegated bound handler tuple</h2>
      <p>
        Hover <b>Save</b>, then <b>Publish</b> — both share the same{" "}
        <code>[showTooltip, data]</code> tuple on <code>onMouseEnter</code>.
      </p>
      <button onMouseEnter={tooltipHandler}>Save</button>{" "}
      <button onMouseEnter={tooltipHandler}>Publish</button>
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
