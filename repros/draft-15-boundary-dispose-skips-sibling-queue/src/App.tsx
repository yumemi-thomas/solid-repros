import { createEffect, createLoadingBoundary, createRoot, createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [step, setStep] = createSignal(0);
  const [verdict, setVerdict] = createSignal<Verdict>();
  const log: string[] = [];
  let disposeCouponPanel!: () => void;

  // Boundary A: the coupon panel — its own effect disposes it when applied.
  createRoot(d => {
    disposeCouponPanel = d;
    createLoadingBoundary(
      () => {
        createEffect(step, v => {
          log.push(`a${v}`);
          if (v === 1) disposeCouponPanel(); // coupon applied → close this panel
        });
        return "A";
      },
      () => "loadingA"
    );
  });
  // Boundary B: the sibling order-summary panel.
  createLoadingBoundary(
    () => {
      createEffect(step, v => {
        log.push(`b${v}`);
      });
      return "B";
    },
    () => "loadingB"
  );

  function applyCoupon() {
    setStep(1);
    flush();
    const ok = log.includes("b1");
    setVerdict({
      ok,
      actual: `log = [${log.join(", ")}]${ok ? "" : " — b1 missing"}`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Sibling boundary's effect skipped on dispose</h2>
      <p>
        Both boundaries' effects track the same signal; boundary A's effect disposes A when it
        sees the update. Boundary B's queued effect should still run in that flush.
      </p>
      <button onClick={applyCoupon}>apply coupon</button>
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
            <p>Expected boundary B to observe v === 1 (log contains "b1").</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
