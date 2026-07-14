import { createFileRoute, Link } from "@tanstack/solid-router";
import { createMemo, Loading, Reveal } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));

// Slow personalized panel — has its OWN fallback, so it should never hold
// the rest of the page. It is nested inside the product slot's content.
function Recommendations() {
  const recs = createMemo(async () => later("Camp Stove · Trail Mug · Headlamp", 2500));
  return <p>{recs()}</p>;
}

function ProductDetails() {
  const product = createMemo(async () => later("Trail Pack 40L — $149", 300));
  return (
    <section>
      <h1>{product()}</h1>
      <h3>You may also like</h3>
      <Loading fallback={<p style="color:gray">loading recommendations…</p>}>
        <Recommendations />
      </Loading>
    </section>
  );
}

function Reviews() {
  const reviews = createMemo(async () => later("★★★★★ 4.8 — 1,204 reviews", 800));
  return <aside>{reviews()}</aside>;
}

function Home() {
  return (
    <main>
      <h2>Product page — Reveal order="together"</h2>
      <p>
        Product (300ms) and reviews (800ms) should reveal together at ~800ms. Recommendations
        (2500ms) is a nested boundary with its own fallback. BUG: the whole page stays on skeletons
        until ~2500ms.
      </p>
      <Reveal order="together">
        <Loading fallback={<p style="color:gray">loading product…</p>}>
          <ProductDetails />
        </Loading>
        <Loading fallback={<p style="color:gray">loading reviews…</p>}>
          <Reviews />
        </Loading>
      </Reveal>
      <Link to="/control">Control page (no nested boundary)</Link>
    </main>
  );
}

export const Route = createFileRoute("/")({ component: Home });
