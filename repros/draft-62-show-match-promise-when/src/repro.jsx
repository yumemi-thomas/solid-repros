// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: on the CLIENT, a Promise passed to <Show when> /
// <Match when> is routed through the async machinery — the boundary suspends and
// the callback receives the RESOLVED value. On the SERVER, `when` is read in a
// plain sync memo with no thenable detection, so a pending Promise is just a
// truthy object: `when={Promise.resolve(false)}` renders the CHILDREN (wrong
// branch), the keyed callback gets the RAW Promise (member reads are undefined),
// and the first pending <Match> always wins. The asymmetry is new in 2.0 (1.x
// treated the Promise as truthy on BOTH sides). — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/62-show-match-promise-when.md
import { renderToStringAsync } from "@solidjs/web";
import { Show, Switch, Match, Loading } from "solid-js";

// A session lookup, the way any async auth layer exposes it.
const canEdit = () => Promise.resolve(false);
const fetchUser = () => Promise.resolve({ name: "Ada" });

// 1. `when` resolving to false still renders the protected children on the server.
const guarded = await renderToStringAsync(() => (
  <Loading fallback={<p>checking…</p>}>
    <Show when={canEdit()} fallback={<p>read-only</p>}>
      <button>Delete post</button>
    </Show>
  </Loading>
));

// 2. The keyed callback receives the raw Promise instead of the resolved user.
let received;
const greeting = await renderToStringAsync(() => (
  <Loading fallback={<p>loading…</p>}>
    <Show when={fetchUser()} keyed>
      {(user) => {
        received = user;
        return <p>Hello {user.name}</p>;
      }}
    </Show>
  </Loading>
));

// 3. Same class for <Match when={promise}> — first pending Match wins.
const tools = await renderToStringAsync(() => (
  <Loading fallback={<p>loading…</p>}>
    <Switch fallback={<p>overview</p>}>
      <Match when={canEdit()}>
        <p>owner tools</p>
      </Match>
    </Switch>
  </Loading>
));

console.log("guarded:", guarded);
console.log("greeting:", greeting);
console.log(
  "keyed callback received:",
  received instanceof Promise ? "the raw Promise" : JSON.stringify(received),
);
console.log("tools:", tools);

// Client (browser build) suspends then narrows: "read-only" / "Hello Ada" / "overview".
const pass =
  guarded.includes("read-only") &&
  greeting.includes("Hello Ada") &&
  tools.includes("overview");
console.log(
  pass
    ? "\nPASS — bug is fixed (server awaited and narrowed the Promise like the client)"
    : "\nFAIL — bug reproduced: server treated the pending Promise as a truthy value",
);
