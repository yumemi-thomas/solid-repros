import { createFileRoute, Link } from "@tanstack/solid-router";
import { createMemo, Errored, Loading, Reveal } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));

function OrderSummary() {
  const order = createMemo(async () => later("Order #4021 — Trail Pack 40L, $149", 300));
  return (
    <section data-timing="order">
      <h1>{order()}</h1>
    </section>
  );
}

// Flaky third-party panel: wrapped in <Errored> for robustness — exactly what
// TanStack Router's CatchBoundary (= Solid.Errored) does automatically around
// any route with an errorComponent.
function PaymentOptions() {
  const options = createMemo(async () => later("Pay with: Card · Konbini · PayPay", 2000));
  return <aside data-timing="payment">{options()}</aside>;
}

function Home() {
  return (
    <main>
      <h2>Checkout — Reveal order="together", payment panel wrapped in Errored</h2>
      <p>
        The client treats the Errored-wrapped panel as OUTSIDE the group: order summary (300ms)
        reveals on its own, panel (2000ms) independently. The server enrolls it: hard refresh holds
        everything on skeletons to ~2s.
      </p>
      <pre
        data-timing-verdict
        data-fast="order"
        data-slow="payment"
        data-min-gap="1000"
        data-result="pending"
      >
        Watching the streamed UI… expected the order near 300ms and payment near 2000ms.
      </pre>
      <Reveal order="together">
        <Loading fallback={<p style="color:gray">loading order…</p>}>
          <OrderSummary />
        </Loading>
        <Errored fallback={<i>payment panel unavailable</i>}>
          <Loading fallback={<p style="color:gray">loading payment options…</p>}>
            <PaymentOptions />
          </Loading>
        </Errored>
      </Reveal>
      <Link to="/control">Control page (no Errored wrapper)</Link>
    </main>
  );
}

export const Route = createFileRoute("/")({ component: Home });
