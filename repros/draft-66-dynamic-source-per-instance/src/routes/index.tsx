import { createFileRoute } from "@tanstack/solid-router";
import { dynamic } from "@solidjs/web";

let calls = 0;
const SharedSlot = dynamic(() => {
  calls++;
  return () => <b>A</b>;
});
function Home() {
  return (
    <main>
      <h1>Shared dashboard widget</h1>
      <div>
        <SharedSlot /> | <SharedSlot /> | <SharedSlot />
      </div>
      <p data-source-calls={calls}>Source evaluations: {calls} (expected 1)</p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
