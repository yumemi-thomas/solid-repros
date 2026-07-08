// Re-arming createReaction before it fires accumulates arms instead of
// replacing tracked sources (1.x replaces): a superseded track() still fires,
// and the callback fires once per accumulated arm. — Solid 2.0.0-beta.15.
// The verdict runs automatically on load.
// Issue draft: issue-drafts/16-createreaction-rearm-accumulates.md
import { createSignal, createReaction, createRoot, flush, Show } from "solid-js";

export default function App() {
  const [status, setStatus] = createSignal();

  queueMicrotask(() => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal(0);
    let fired = 0;

    createRoot(() => {
      const track = createReaction(() => {
        fired++;
      });
      track(() => a());
      track(() => b()); // 1.x: REPLACES the a() subscription
    });
    flush();

    setA(1); // superseded arm — must NOT fire
    flush();
    const afterA = fired;

    setB(1); // armed — fires once
    flush();
    const afterB = fired;

    const ok = afterA === 0 && afterB === 1;
    setStatus({
      ok,
      expected: "bump a: 0 fires; bump b: 1 fire total",
      actual: `after bump a: ${afterA} fire(s); after bump b: ${afterB} fire(s)`,
    });
  });

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>createReaction re-arm accumulates arms</h2>
      <Result status={status()} />
      <p style={{ color: "#666" }}>
        Calling track() again before the reaction fires should replace the tracked
        sources (1.x semantics), not keep the old one live.
      </p>
    </div>
  );
}

function Result(props) {
  return (
    <Show when={props.status} fallback={<p>running…</p>}>
      {(s) => (
        <div
          style={{
            padding: "12px",
            "border-radius": "8px",
            color: "#fff",
            background: s().ok ? "#137333" : "#c5221f",
          }}
        >
          <strong>{s().ok ? "PASS — bug is fixed" : "FAIL — bug reproduced"}</strong>
          <div>
            expected: <code>{s().expected}</code>
          </div>
          <div>
            actual: <code>{s().actual}</code>
          </div>
        </div>
      )}
    </Show>
  );
}
