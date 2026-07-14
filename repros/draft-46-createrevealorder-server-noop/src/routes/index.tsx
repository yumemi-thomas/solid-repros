import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createRevealOrder, Loading, Reveal } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));
function Card(props: { name: string; delay: number; timing: string }) {
  const value = createMemo(async () => later(props.name, props.delay));
  return <p data-timing={props.timing}>{value()}</p>;
}
const cards = () => (
  <>
    <Loading fallback={<i>Loading card A…</i>}>
      <Card name="Card A" delay={200} timing="card-a" />
    </Loading>
    <Loading fallback={<i>Loading card B…</i>}>
      <Card name="Card B" delay={600} timing="card-b" />
    </Loading>
  </>
);
function CardGrid() {
  return createRevealOrder(cards, { order: () => "natural" });
}
function Home() {
  const hero = createMemo(async () => later("Summer collection", 100));
  return (
    <main>
      <h1>Storefront</h1>
      <p>
        The design-system grid is one nested reveal group; its cards must not become direct members
        of the page's together group.
      </p>
      <pre
        data-timing-verdict
        data-fast="hero,card-a"
        data-slow="card-b"
        data-min-gap="180"
        data-result="pending"
      >
        Watching the streamed UI… expected hero/card A first, card B later.
      </pre>
      <Reveal order="together">
        <Loading fallback={<b>Loading hero…</b>}>
          <h2 data-timing="hero">{hero()}</h2>
        </Loading>
        <CardGrid />
      </Reveal>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
