import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createSignal, flush, onSettled } from "solid-js";

function Home() {
  const [count, setCount] = createSignal(1);
  const label = createMemo(() => "T", { transparent: true });
  let value!: HTMLSpanElement;
  const [verdict, setVerdict] = createSignal("Waiting for hydration…");
  onSettled(() => {
    setCount(2);
    flush();
    queueMicrotask(() =>
      setVerdict(
        value.textContent === "after 2"
          ? "PASS — hydrated binding updated"
          : "FAIL — visible DOM stayed " + JSON.stringify(value.textContent)
      )
    );
  });
  const status = () =>
    verdict().startsWith("PASS") ? "pass" : verdict().startsWith("FAIL") ? "fail" : "pending";
  return (
    <main>
      <h1>Live dashboard card</h1>
      <p>
        A transparent wrapper memo must consume the same hydration-id slots on server and client.
      </p>
      <div>
        <b>{label()}</b>
        <span ref={value}>after {count()}</span>
      </div>
      <pre id="browser-verdict" data-result={status()}>
        {verdict()}
      </pre>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
