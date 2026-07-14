import { createFileRoute } from "@tanstack/solid-router";
import { Loading, Match, Show, Switch } from "solid-js";

const canEdit = () => Promise.resolve(false);
function Home() {
  return (
    <main>
      <h1>Article permissions</h1>
      <p>
        The permission promise resolves false, so only read-only and overview content should appear.
      </p>
      <Loading fallback={<p>Checking permissions…</p>}>
        <Show
          when={canEdit()}
          fallback={
            <p data-read-only data-result="pass">
              PASS — Read-only access
            </p>
          }
        >
          <div>
            <button data-delete>Delete post</button>
            <p data-result="fail">
              BUG REPRODUCED — protected action rendered from the raw Promise.
            </p>
          </div>
        </Show>
        <Switch
          fallback={
            <p data-overview data-result="pass">
              PASS — Overview
            </p>
          }
        >
          <Match when={canEdit()}>
            <p data-owner data-result="fail">
              BUG REPRODUCED — owner tools rendered from the raw Promise.
            </p>
          </Match>
        </Switch>
      </Loading>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
