import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createSignal, Errored, Loading, onSettled } from "solid-js";

const later = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
function Reviews() {
  const review = createMemo(async () => {
    await later(80);
    throw new Error("review service unavailable");
  });
  return <p>{review()}</p>;
}
function Home() {
  const [events, setEvents] = createSignal<string[]>([]);
  onSettled(() => {
    const update = () => setEvents([...(window as any).__reproEvents]);
    update();
    const timer = window.setInterval(update, 50);
    return () => window.clearInterval(timer);
  });
  return (
    <main>
      <h1>Product reviews</h1>
      <p>
        A failed SSR request should reach the boundary without creating browser-level rejected
        promises.
      </p>
      <Errored
        fallback={error => (
          <p data-reviews-error>Reviews unavailable: {String(error()?.message ?? error())}</p>
        )}
      >
        <Loading fallback={<p>Loading reviews…</p>}>
          <Reviews />
        </Loading>
      </Errored>
      <p>Global browser errors: {events().length}</p>
      <pre id="browser-verdict" data-result={events().length === 0 ? "pass" : "fail"}>
        {events().length === 0
          ? "PASS — no phantom browser rejection"
          : "FAIL — " + events().length + " global rejection(s): " + events().join(" | ")}
      </pre>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
