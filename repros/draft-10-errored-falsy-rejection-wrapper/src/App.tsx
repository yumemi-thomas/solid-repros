/** @jsxImportSource @solidjs/web */
import { Errored, Loading, createMemo } from "solid-js";

export default function App() {
  // Cancellation-style rejection: no value, like a request that was superseded
  // or aborted. Any nullish rejection (reject(), reject(null)) hits this.
  const user = createMemo<Promise<string>>(() => Promise.reject());

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Errored fallback for a bare Promise.reject()</h2>
      <Errored fallback={err => <Verdict error={err()} />}>
        <Loading fallback={<p>loading…</p>}>
          <p>user: {user()}</p>
        </Loading>
      </Errored>
      <p style={{ color: "#666" }}>
        err() should be the original rejection value (undefined), not the framework's
        internal StatusError wrapper.
      </p>
    </div>
  );
}

function describe(err: unknown) {
  if (err === null || typeof err !== "object") return `err() = ${String(err)}`;
  const e = err as Error & { source?: unknown; cause?: unknown };
  return [
    `err() is an object — the internal wrapper leaked:`,
    `  constructor: ${e.constructor?.name}`,
    `  message: ${JSON.stringify(e.message)}`,
    `  instanceof Error: ${err instanceof Error}`,
    `  internal .source: ${"source" in e ? "present — a reactive node leaked into userland" : "none"}`,
    `  .cause: ${String(e.cause)}`
  ].join("\n");
}

function Verdict(props: { error: unknown }) {
  const ok = () => props.error === undefined;
  return (
    <div
      style={{
        padding: "12px",
        "border-radius": "8px",
        color: "#fff",
        background: ok() ? "#137333" : "#c5221f"
      }}
    >
      <strong>{ok() ? "PASS — bug is fixed" : "FAIL — bug reproduced"}</strong>
      <div>
        expected: <code>err() === undefined (the original rejection value)</code>
      </div>
      <pre style={{ margin: "8px 0 0", "white-space": "pre-wrap" }}>{describe(props.error)}</pre>
    </div>
  );
}
