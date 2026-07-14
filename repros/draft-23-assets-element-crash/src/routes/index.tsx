import { createFileRoute } from "@tanstack/solid-router";
import { useAssets } from "@solidjs/web";

function SupportWidget() {
  useAssets(() => <link rel="stylesheet" href="/support-widget.css" />);
  return (
    <aside>
      <button>Chat with support</button>
    </aside>
  );
}

function Home() {
  return (
    <main>
      <h1>Support</h1>
      <p>The widget contributes its own stylesheet during SSR.</p>
      <SupportWidget />
      <p data-result="pass">PASS — route rendered and the asset was collected.</p>
    </main>
  );
}

export const Route = createFileRoute("/")({ component: Home });
