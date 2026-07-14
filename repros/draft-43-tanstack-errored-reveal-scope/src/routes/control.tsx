import { createFileRoute, Link } from "@tanstack/solid-router";
import { createMemo, Loading, Reveal } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));

function OrderSummary() {
  const order = createMemo(async () => later("Order #4021 — Trail Pack 40L, $149", 300));
  return (
    <section>
      <h1>{order()}</h1>
    </section>
  );
}

function PaymentOptions() {
  const options = createMemo(async () => later("Pay with: Card · Konbini · PayPay", 2000));
  return <aside>{options()}</aside>;
}

function Control() {
  return (
    <main>
      <h2>Control — same page, no Errored wrapper</h2>
      <p>Both slots are direct group members: revealing together at ~2s is CORRECT here.</p>
      <Reveal order="together">
        <Loading fallback={<p style="color:gray">loading order…</p>}>
          <OrderSummary />
        </Loading>
        <Loading fallback={<p style="color:gray">loading payment options…</p>}>
          <PaymentOptions />
        </Loading>
      </Reveal>
      <Link to="/">Repro page (Errored-wrapped panel)</Link>
    </main>
  );
}

export const Route = createFileRoute("/control")({ component: Control });
