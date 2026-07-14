import { createFileRoute } from "@tanstack/solid-router";

function ReportCard() {
  return (
    <article
      data-card
      class={{ selected: false, highlighted: true, card: true } as any}
      style={{ color: undefined, background: "red" } as any}
    >
      Weekly report
    </article>
  );
}

function Home() {
  return (
    <main>
      <h1>Report card</h1>
      <p>Falsy first entries should be skipped without leading separators.</p>
      <ReportCard />
      <p data-result="fail">
        BUG REPRODUCED — the SSR attribute string starts with separators before the first emitted
        class/style entry. The red card makes the affected attributes easy to inspect.
      </p>
    </main>
  );
}

export const Route = createFileRoute("/")({ component: Home });
