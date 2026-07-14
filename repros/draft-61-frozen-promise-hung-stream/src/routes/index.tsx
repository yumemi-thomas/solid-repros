import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, Loading } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));
function Report() {
  const data = createMemo(() => Object.freeze(later("Report ready", 100)));
  return <p data-result="pass">{data()}</p>;
}
function Home() {
  return (
    <main>
      <h1>Immutable cache result</h1>
      <p>A cache may freeze the Promise it returns; the stream should still finish.</p>
      <Loading fallback={<p>Loading report…</p>}>
        <Report />
      </Loading>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
