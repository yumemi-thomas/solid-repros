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
  const [checked, setChecked] = createSignal(false);
  onSettled(() => {
    const update = () => setEvents([...(window as any).__reproEvents]);
    update();
    const timer = window.setInterval(update, 50);
    const settled = window.setTimeout(() => setChecked(true), 700);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(settled);
    };
  });
  const status = () => (events().length > 0 ? "fail" : checked() ? "pass" : "pending");
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
      <pre id="browser-verdict" data-result={status()}>
        {events().length > 0
          ? "BUG REPRODUCED — " + events().length + " global rejection(s): " + events().join(" | ")
          : checked()
            ? "PASS — no phantom browser rejection"
            : "Checking browser-level promise rejections…"}
      </pre>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
