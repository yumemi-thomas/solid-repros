// Re-arming createReaction before it fires accumulates arms instead of
// replacing tracked sources (1.x replaces). — Solid 2.0.0-beta.16
// Arm, then bump a: 1.x leaves the counter at 0 (a was superseded); 2.0 shows 1.
// Issue draft: issue-drafts/16-createreaction-rearm-accumulates.md
import { createSignal, createReaction, flush } from "solid-js";

export default function App() {
  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  const [fired, setFired] = createSignal(0);
  let count = 0; // reaction writes a plain counter (a signal write here halts)

  // No createRoot: the component is the owner createReaction needs.
  const track = createReaction(() => {
    count++;
  });

  // No queueMicrotask: bumps run in click handlers, each its own flush.
  const bump = (set, get) => () => {
    set(get() + 1);
    flush();
    setFired(count);
  };

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>createReaction re-arm accumulates arms</h2>
      <p>
        reaction fired: <b>{fired()}</b> time(s)
      </p>
      <button
        onClick={() => {
          track(() => a());
          track(() => b());
        }}
      >
        arm (track a, then b)
      </button>{" "}
      <button onClick={bump(setA, a)}>bump a</button>{" "}
      <button onClick={bump(setB, b)}>bump b</button>
      <p style={{ color: "#666" }}>
        Arm, then bump a → should stay 0 (a was superseded by track(b)); 2.0 shows 1. Then bump b →
        1.x total 1, 2.0 total 2: both arms stayed live.
      </p>
    </main>
  );
}
