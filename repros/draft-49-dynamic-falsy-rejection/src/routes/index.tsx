import { createFileRoute } from "@tanstack/solid-router";
import { dynamic } from "@solidjs/web";
import { Errored, Loading } from "solid-js";

const MissingPanel = dynamic(() => Promise.reject(undefined));
function Home() {
  return (
    <main>
      <h1>Account</h1>
      <p>Expected: a failed lazy panel reaches the error fallback.</p>
      <Errored
        fallback={
          <p data-panel-error data-result="pass">
            PASS — Panel unavailable fallback rendered.
          </p>
        }
      >
        <Loading fallback={<p>Loading panel…</p>}>
          <MissingPanel />
          <p data-result="fail">
            BUG REPRODUCED — falsy rejection was treated as an empty successful panel.
          </p>
        </Loading>
      </Errored>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
