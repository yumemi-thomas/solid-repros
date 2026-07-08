// The compute-phase createEffect `error` handler receives Solid's internal
// StatusError wrapper (err instanceof MyError === false) instead of the thrown
// error, while <Errored> receives the original MyError for the same throw.
// — Solid 2.0.0-beta.15. Click both buttons and compare the two panels.
// Issue draft: issue-drafts/15-statuserror-wrapper.md
import { Errored, Show, createEffect, createSignal } from "solid-js";

class MyError extends Error {}

function describeErr(err) {
  const cause = err instanceof Error ? err.cause : undefined;
  const constructor =
    err !== null && typeof err === "object" ? err.constructor.name : String(err);

  return [
    `instanceof MyError: ${err instanceof MyError}`,
    `constructor: ${constructor}`,
    `message: ${err instanceof Error ? err.message : String(err)}`,
    `cause instanceof MyError: ${cause instanceof MyError}`,
    `has internal .source: ${!!err && typeof err === "object" && "source" in err}`,
  ].join("\n");
}

function ErroredControl() {
  const [armed, setArmed] = createSignal(false);

  function ThrowBoundaryError() {
    throw new MyError("boom-boundary");
  }

  return (
    <Errored
      fallback={(err) => (
        <pre>
          Errored fallback received:{"\n"}
          {describeErr(err())}
        </pre>
      )}
    >
      <button onClick={() => setArmed(true)}>throw under &lt;Errored&gt;</button>
      <Show when={armed()}>
        <ThrowBoundaryError />
      </Show>
    </Errored>
  );
}

export default function App() {
  const [effectArmed, setEffectArmed] = createSignal(false);
  let effectLog;

  createEffect(
    () => {
      if (effectArmed()) throw new MyError("boom-effect-compute");
    },
    {
      effect: () => {},
      // raw DOM write — a signal write here would throw
      // REACTIVE_WRITE_IN_OWNED_SCOPE in dev (the `error` handler runs in an
      // owned scope, unlike `effect`) and halt the app
      error: (err) => {
        effectLog.textContent = `EffectBundle.error received:\n${describeErr(err)}`;
      },
    }
  );

  return (
    <div style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Error identity differs between effect `error` and &lt;Errored&gt;</h2>

      <button onClick={() => setEffectArmed(true)}>
        throw in effect compute phase
      </button>
      <pre ref={effectLog}>
        EffectBundle.error received:{"\n"}(not thrown yet)
      </pre>

      <ErroredControl />
    </div>
  );
}
