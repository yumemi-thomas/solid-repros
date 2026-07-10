/** @jsxImportSource @solidjs/web */
import {
  createSignal,
  createMemo,
  createErrorBoundary,
  createLoadingBoundary,
  createRenderEffect,
  createRoot,
  flush,
  Show
} from "solid-js";

type Status = { ok: boolean; expected: string; actual: string };

// A Promises/A+ thenable that settles (rejects) synchronously.
function syncRejectedThenable(error: unknown) {
  return {
    then(_onFulfilled: any, onRejected?: (e: unknown) => void) {
      onRejected?.(error);
    }
  } as any;
}

export default function App() {
  const [status, setStatus] = createSignal<Status>();

  (async () => {
    await Promise.resolve(); // run the scenario off the render flush

    const boom = new Error("iterator sync boom");
    const iterable = {
      [Symbol.asyncIterator]() {
        return { next: () => syncRejectedThenable(boom) };
      }
    };

    let observed: unknown = "NOT_CALLED";
    let result: any;

    const dispose = createRoot(dispose => {
      const memo = createMemo(() => iterable as AsyncIterable<number>);
      const b = createErrorBoundary(
        () =>
          createLoadingBoundary(
            () => memo(),
            () => "loading"
          )(),
        err => {
          observed = err();
          return "errored";
        }
      );
      createRenderEffect(
        () => (result = b()),
        () => {}
      );
      return dispose;
    });

    flush();
    for (let i = 0; i < 30; i++) await Promise.resolve();
    flush();
    await new Promise<void>(r => setTimeout(r, 300));
    flush();
    dispose();

    setStatus({
      ok: result === "errored" && observed === boom,
      expected: `reaches Errored with the original error ("${boom.message}")`,
      actual:
        result === "loading"
          ? "still on the Loading fallback → the sync rejection was silently dropped (HUNG)"
          : result === "errored"
            ? `errored, but with a different value: ${String(observed)}`
            : `result = ${String(result)}`
    });
  })();

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Async iterator that rejects synchronously</h2>
      <Result status={status()} />
      <p style={{ color: "#666" }}>
        A synchronous iterator rejection should reach the error boundary (like the
        promise-shaped sync rejection does), not stay pending forever.
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
