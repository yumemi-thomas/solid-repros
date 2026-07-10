/** @jsxImportSource @solidjs/web */
// Errored fallback gets an internal StatusError wrapper for a bare rejection — Solid 2.0.0-beta.16
// Draft: issue-drafts/10-errored-falsy-rejection-wrapper.md
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

function Verdict(props: { error: unknown }) {
  const leakedWrapper = () =>
    props.error != null && typeof props.error === "object" && "source" in props.error;
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
      <div>
        actual:{" "}
        <code>
          {leakedWrapper()
            ? `internal StatusError wrapper leaked (err() has .source): ${String(props.error)}`
            : `err() = ${String(props.error)}`}
        </code>
      </div>
    </div>
  );
}
