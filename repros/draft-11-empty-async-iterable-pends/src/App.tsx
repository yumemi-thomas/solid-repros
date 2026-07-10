/** @jsxImportSource @solidjs/web */
// Empty async iterable leaves the Loading boundary pending forever — Solid 2.0.0-beta.16
// Draft: issue-drafts/11-empty-async-iterable-pends.md
// Repro test: packages/solid-signals/tests/hunt2-empty-async-iterable.test.ts
import {
  createSignal,
  createMemo,
  createLoadingBoundary,
  createRenderEffect,
  createRoot,
  flush,
  Show
} from "solid-js";

type Status = { ok: boolean; expected: string; actual: string };

export default function App() {
  const [status, setStatus] = createSignal<Status>();

  (async () => {
    await Promise.resolve(); // run the scenario off the render flush

    let result: any;
    const dispose = createRoot(dispose => {
      // async generator that completes without ever yielding a value
      const memo = createMemo(() => (async function* () {})());
      const b = createLoadingBoundary(
        () => memo(),
        () => "loading"
      );
      createRenderEffect(
        () => (result = b()),
        () => {}
      );
      return dispose;
    });

    flush();
    // result === "loading" here

    // give the async generator plenty of time to complete + timeout marker
    for (let i = 0; i < 30; i++) await Promise.resolve();
    flush();
    await new Promise<void>(r => setTimeout(r, 300));
    flush();
    dispose();

    setStatus({
      ok: result === undefined,
      expected: "boundary settles to undefined (like the empty sync iterator does)",
      actual:
        result === "loading"
          ? "still on the Loading fallback after 300ms → pends forever (HUNG)"
          : `settled to ${String(result)}`
    });
  })();

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Empty async iterable in an async memo</h2>
      <Result status={status()} />
      <p style={{ color: "#666" }}>
        An async generator that completes without yielding should settle the boundary with
        undefined, matching the empty sync iterator.
      </p>
    </div>
  );
}

function Result(props: { status?: Status }) {
  return (
    <Show when={props.status} fallback={<p>running… (waiting up to 300ms)</p>}>
      <div
        style={{
          padding: "12px",
          "border-radius": "8px",
          color: "#fff",
          background: props.status!.ok ? "#137333" : "#c5221f"
        }}
      >
        <strong>{props.status!.ok ? "PASS — bug is fixed" : "FAIL — bug reproduced"}</strong>
        <div>
          expected: <code>{props.status!.expected}</code>
        </div>
        <div>
          actual: <code>{props.status!.actual}</code>
        </div>
      </div>
    </Show>
  );
}
