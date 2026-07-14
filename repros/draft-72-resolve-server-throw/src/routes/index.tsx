import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, resolve } from "solid-js";

export const Route = createFileRoute("/")({
  loader: async () => {
    const user = createMemo(async () => ({ name: "Ada" }));
    return { name: await resolve(() => user().name) };
  },
  component: Home,
  errorComponent: RouteError
});
function Home() {
  const user = Route.useLoaderData();
  return (
    <main>
      <h1>User</h1>
      <p data-result="pass">PASS — resolved {user().name} during SSR.</p>
    </main>
  );
}
function RouteError(props: { error: unknown }) {
  return (
    <main>
      <h1>User loader</h1>
      <p data-result="fail">
        BUG REPRODUCED — server resolve() threw instead of returning a Promise:{" "}
        {String((props.error as Error)?.message ?? props.error)}
      </p>
    </main>
  );
}
