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
      <p>A null child should be ignored and the fallback should render.</p>
      <Switch
        fallback={
          <p data-not-found data-result="pass">
            PASS — Not found fallback rendered.
          </p>
        }
      >
        <AdminRoutes isAdmin={false} />
      </Switch>
    </main>
  );
}
function RouteError(props: { error: unknown }) {
  return (
    <main>
      <h1>Settings</h1>
      <p data-result="fail">
        BUG REPRODUCED — the null child crashed SSR:{" "}
        {String((props.error as Error)?.message ?? props.error)}
      </p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home, errorComponent: RouteError });
