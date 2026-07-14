import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createRevealOrder, Loading, Reveal } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));
function Card(props: { name: string; delay: number }) {
  const value = createMemo(async () => later(props.name, props.delay));
  return <p>{value()}</p>;
}
const cards = () => (
  <>
    <Loading fallback={<i>Loading card A…</i>}>
      <Card name="Card A" delay={200} />
    </Loading>
    <Loading fallback={<i>Loading card B…</i>}>
      <Card name="Card B" delay={600} />
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
      <Reveal order="together">
        <Loading fallback={<b>Loading hero…</b>}>
          <h2>{hero()}</h2>
        </Loading>
        <CardGrid />
      </Reveal>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
