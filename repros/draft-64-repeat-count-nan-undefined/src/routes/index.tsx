import { createFileRoute } from "@tanstack/solid-router";
import { Repeat } from "solid-js";

function List(props: { label: string; count: number | undefined }) {
  return (
    <section>
      <h2>{props.label}</h2>
      <Repeat count={props.count as number} fallback={<p data-empty>No rows</p>}>
        {index => <p>Row {index}</p>}
      </Repeat>
    </section>
  );
}
function Home() {
  return (
    <main>
      <h1>Responsive result grid</h1>
      <p>
        Before layout is measured, a real grid may calculate an undefined or NaN column count. SSR
        and hydration must agree without crashing.
      </p>
      <List label="Zero control" count={0} />
      <List label="Configuration pending" count={undefined} />
      <List label="Invalid layout measurement" count={Number.NaN} />
      <pre id="browser-verdict" data-result="pending">
        Checking hydration… a RangeError will turn this result red.
      </pre>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
