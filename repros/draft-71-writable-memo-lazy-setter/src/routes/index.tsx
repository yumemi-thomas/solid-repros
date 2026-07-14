import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

function Home() {
  let fetches = 0;
  const [, setDetails] = createSignal(
    () => {
      fetches++;
      return "fetched";
    },
    { lazy: true }
  );
  const returned = setDetails("override");
  const ok = fetches === 0 && returned === "override";
  return (
    <main>
      <h1>Closed details panel</h1>
      <p>Fetches before first read: {fetches}</p>
      <p>Setter returned: {String(returned)}</p>
      <p data-result={ok ? "pass" : "fail"}>
        {ok ? "PASS" : "FAIL"} — lazy writable memo diverged during SSR.
      </p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
