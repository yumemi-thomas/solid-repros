// Re-arming createReaction before it fires accumulates arms instead of
// replacing tracked sources (1.x replaces): a superseded track() still fires,
// and the callback fires once per accumulated arm. — Solid 2.0.0-beta.15.
// Click 1 → 2 → 3 in order and read the verdict.
// Issue draft: issue-drafts/16-createreaction-rearm-accumulates.md
import { createSignal, createReaction, flush, Show } from "solid-js";

export default function App() {
  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  // Plain counter — the reaction writes nothing reactive (a signal write in the
  // reaction callback would halt the reactive system).
  let fired = 0;
  const [snap, setSnap] = createSignal({ armed: false, afterA: null, afterB: null });

  // No createRoot: the component itself is the owner createReaction needs.
  const track = createReaction(() => {
    fired++;
  });

  function arm() {
    track(() => a());
    track(() => b()); // 1.x: REPLACES the a() subscription
    flush();
    setSnap({ armed: true, afterA: null, afterB: null });
  }
  function bumpA() {
    setA(a() + 1);
    flush(); // run any armed reaction now, then read the counter
    setSnap((s) => ({ ...s, afterA: fired }));
  }
  function bumpB() {
    setB(b() + 1);
    flush();
    setSnap((s) => ({ ...s, afterB: fired }));
  }

  const done = () => {
    const s = snap();
    return s.afterA !== null && s.afterB !== null;
  };
  // Correct (1.x): bump a fires nothing, bump b fires once → total 1.
  const ok = () => snap().afterA === 0 && snap().afterB === 1;

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>createReaction re-arm accumulates arms</h2>
      <p>
        Click in order:{" "}
        <button onClick={arm}>1. arm — track(a) then track(b)</button>{" "}
        <button onClick={bumpA}>2. bump a</button>{" "}
        <button onClick={bumpB}>3. bump b</button>
      </p>
      <p>reaction fired: {fired} time(s) total (see verdict after step 3)</p>
      <Show when={done()} fallback={<p style={{ color: "#666" }}>run steps 1–3…</p>}>
        <div
          style={{
            padding: "12px",
            "border-radius": "8px",
            color: "#fff",
            background: ok() ? "#137333" : "#c5221f",
          }}
        >
          <strong>{ok() ? "PASS — bug is fixed" : "FAIL — bug reproduced"}</strong>
          <div>expected: bump a fires 0; bump b brings total to 1</div>
          <div>
            actual: after bump a = {snap().afterA} fire(s); after bump b ={" "}
            {snap().afterB} fire(s)
          </div>
        </div>
      </Show>
      <p style={{ color: "#666" }}>
        Arming twice before the reaction fires should replace the tracked sources
        (1.x semantics), not keep the superseded one live.
      </p>
    </div>
  );
}
