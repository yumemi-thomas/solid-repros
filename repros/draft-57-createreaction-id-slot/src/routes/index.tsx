import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createReaction, createSignal, Loading } from "solid-js";

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms));
function Home() {
  const [refreshes, setRefreshes] = createSignal(0);
  const reaction = createReaction(() => console.log("dashboard filter changed"));
  reaction(() => refreshes());
  const stats = createMemo(async () => later("42 visits", 40));
  return (
    <main>
      <h1>Analytics dashboard</h1>
      <p>
        Arming a documented reaction must reserve the same hydration-id slot on server and client.
      </p>
      <Loading fallback={<p>Loading visits…</p>}>
        <p data-stats>{stats()}</p>
      </Loading>
      <button onClick={() => setRefreshes(value => value + 1)}>Refresh filters</button>
      <pre id="browser-verdict">
        Waiting for hydration. A hydration guard error or unclaimed-node warning reproduces the bug.
      </pre>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
