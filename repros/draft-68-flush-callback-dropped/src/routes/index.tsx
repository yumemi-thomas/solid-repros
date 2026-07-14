import { createFileRoute } from "@tanstack/solid-router";
import { flush } from "solid-js";

function Home() {
  let prepared = false;
  const returned = flush(() => {
    prepared = true;
    return "ready";
  });
  const ok = prepared && returned === "ready";
  return (
    <main>
      <h1>Server preparation</h1>
      <p>Callback ran: {String(prepared)}</p>
      <p>Returned: {String(returned)}</p>
      <p data-result={ok ? "pass" : "fail"}>
        {ok ? "PASS" : "FAIL"} — flush callback {ok ? "ran" : "was dropped"}.
      </p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
