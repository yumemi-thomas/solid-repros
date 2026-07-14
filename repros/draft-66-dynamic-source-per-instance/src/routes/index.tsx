import { createFileRoute } from "@tanstack/solid-router";
import { dynamic } from "@solidjs/web";

let calls = 0;
const SharedSlot = dynamic(() => {
  calls++;
  return () => <b>A</b>;
});
function Home() {
  const ok = () => calls === 1;
  return (
    <main>
      <h1>Shared dashboard widget</h1>
      <p>Three instances should share one dynamic source evaluation.</p>
      <div>
        <SharedSlot /> | <SharedSlot /> | <SharedSlot />
      </div>
      <p data-source-calls={calls} data-result={ok() ? "pass" : "fail"}>
        {ok() ? "PASS" : "BUG REPRODUCED"} — source evaluated {calls} time(s), expected 1.
      </p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
