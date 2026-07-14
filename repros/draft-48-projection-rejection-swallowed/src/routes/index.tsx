import { createFileRoute } from "@tanstack/solid-router";
import { createStore, Errored, Loading } from "solid-js";

const later = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
function Checkout() {
  const [prices] = createStore(
    async () => {
      await later(50);
      throw new Error("pricing service unavailable");
    },
    { total: "$0.00" }
  );
  return <p data-seed>Total: {prices.total}</p>;
}
function Home() {
  return (
    <main>
      <h1>Checkout</h1>
      <p>Expected: a failed pricing request reaches the error fallback.</p>
      <Errored fallback={<p data-pricing-error>Pricing unavailable</p>}>
        <Loading fallback={<p>Loading prices…</p>}>
          <Checkout />
        </Loading>
      </Errored>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
