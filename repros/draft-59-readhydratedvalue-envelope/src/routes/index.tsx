import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, Errored, Loading } from "solid-js";

const later = <T,>(value: T) => Promise.resolve(value);
function Payload(props: { label: string; value: { s?: number; v: string } }) {
  const data = createMemo(async () => later(props.value), { deferStream: true });
  const ok = () => typeof data() === "object" && data()?.v === props.value.v;
  return (
    <section>
      <h2>{props.label}</h2>
      <Errored
        fallback={error => (
          <p data-case-fail data-result="fail">
            BUG REPRODUCED — hydration treated user data as an error:{" "}
            {String(error()?.message ?? error())}
          </p>
        )}
      >
        <Loading fallback={<p>Loading payload…</p>}>
          <p data-value>Value: {String(data()?.v)}</p>
          <p data-result={ok() ? "pass" : "fail"}>
            {ok()
              ? "PASS — payload remained an object."
              : "BUG REPRODUCED — payload was silently unwrapped."}
          </p>
        </Loading>
      </Errored>
    </section>
  );
}
function Home() {
  return (
    <main>
      <h1>API payloads</h1>
      <p>
        Object fields named s or v are ordinary user data and must round-trip through deferred
        streaming unchanged.
      </p>
      <Payload label="Status-shaped payload" value={{ s: 2, v: "payload" }} />
      <Payload label="Value-shaped payload" value={{ v: "inner" }} />
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
