import { createFileRoute } from "@tanstack/solid-router";
import { Match, Switch } from "solid-js";

function AdminRoutes(props: { isAdmin: boolean }) {
  return props.isAdmin ? (
    <Match when={true}>
      <p>Admin panel</p>
    </Match>
  ) : null;
}
function Home() {
  return (
    <main>
      <h1>Settings</h1>
      <Switch fallback={<p data-not-found>Not found</p>}>
        <AdminRoutes isAdmin={false} />
      </Switch>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
