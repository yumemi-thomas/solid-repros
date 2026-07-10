/** @jsxImportSource @solidjs/web */
// Errored fallback gets an internal StatusError wrapper for Promise.reject(undefined) — Solid 2.0.0-beta.16
// Draft: issue-drafts/10-errored-falsy-rejection-wrapper.md
// Repro test: packages/solid-signals/tests/hunt2-errored-falsy-rejection.test.ts
import {
  createSignal,
  createMemo,
  createErrorBoundary,
  createRenderEffect,
  createRoot,
  flush,
  Show
} from "solid-js";

type Status = { ok: boolean; expected: string; actual: string };

function deferred<T>() {
  let resolveFn!: (v: T) => void;
  let rejectFn!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolveFn = res;
    rejectFn = rej;
  });
  return { promise, resolve: resolveFn, reject: rejectFn };
}

export default function App() {
  const [status, setStatus] = createSignal<Status>();

  (async () => {
    await Promise.resolve(); // run the scenario off the render flush

    const d = deferred<number>();
    let observedError: unknown = "NOT_CALLED";
    let result: any;

    const dispose = createRoot(dispose => {
      const memo = createMemo(() => d.promise);
      const b = createErrorBoundary(
        () => memo(),
        err => {
          observedError = err();
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
    d.reject(undefined); // async source rejects with a falsy value
    for (let i = 0; i < 20; i++) await Promise.resolve();
    flush();
    dispose();

    const ran = observedError !== "NOT_CALLED";
    const isWrapper =
      ran &&
      observedError !== undefined &&
      typeof observedError === "object" &&
      observedError !== null &&
      "source" in (observedError as any);

    setStatus({
      ok: result === "errored" && observedError === undefined,
      expected: "err() === undefined (the original rejection value)",
      actual: !ran
        ? "fallback never ran"
        : isWrapper
          ? `internal StatusError wrapper leaked (err() has .source): ${String(observedError)}`
          : `err() = ${String(observedError)}`
    });
  })();

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Errored fallback for Promise.reject(undefined)</h2>
      <Result status={status()} />
      <p style={{ color: "#666" }}>
        The fallback's err() should be the original rejection value (undefined), not the
        framework's internal StatusError wrapper.
      </p>
    </div>
  );
}

function Result(props: { status?: Status }) {
  return (
    <Show when={props.status} fallback={<p>running…</p>}>
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
