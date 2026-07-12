// Client (hydration) reproduction — open the StackBlitz preview; the verdict
// renders on the page (and to the console).
// SSR/client asymmetry: the SERVER ignores createMemo(..., { transparent: true })
// and consumes a hydration id slot for it, so the emitted `_hk` ids are shifted
// by one vs what the client (which honors `transparent` and consumes no slot)
// expects. The client then claims the wrong node → hydration MISMATCH:
//   • dev build (StackBlitz preview): throws the hydration guard
//     "Failed attempt to create new DOM elements during hydration" +
//     "Hydration completed with 1 unclaimed server-rendered node(s)".
//   • prod build: no throw, but bindings attach to detached DOM so the first
//     post-hydration update is silently DROPPED ("Tafter 1" never becomes "Tafter 2").
// Either way it is the same root cause: a server/client hydration-id drift.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/58-transparent-memo-server.md
import { hydrate } from "@solidjs/web";
import { createMemo, createSignal, flush } from "solid-js";

const container = document.getElementById("app");
const verdict = document.getElementById("verdict");
globalThis._$HY = { events: [], completed: new WeakSet(), fe() {}, r: {} };

// Exact renderToString output of <App/> below on beta.17. The transparent memo
// ate id slot 0 on the server, so the real <div> is emitted as _hk=1, not _hk=0:
container.innerHTML = '<div _hk=1><b>T</b><span>after <!--$-->1<!--/--></span></div>';

function report(lines) {
  verdict.textContent = lines.join("\n");
  console.log(lines.join("\n"));
}

let bump;
try {
  hydrate(() => {
    const [n, setN] = createSignal(1);
    bump = () => setN(2);
    const m = createMemo(() => "T", { transparent: true });
    return (
      <div>
        <b>{m()}</b>
        <span>after {n()}</span>
      </div>
    );
  }, container);
  flush();

  const afterHydrate = container.textContent;
  bump();
  flush();
  const afterUpdate = container.textContent;

  const ok = afterUpdate === "Tafter 2";
  report([
    "=== transparent memo ignored on server -> hydration id drift ===",
    `after hydrate:  ${JSON.stringify(afterHydrate)}`,
    `after setN(2):  ${JSON.stringify(afterUpdate)}`,
    ok
      ? "PASS — bug fixed (update applied)"
      : `FAIL — bug reproduced: first update dropped (expected "Tafter 2", got ${JSON.stringify(afterUpdate)})`,
  ]);
} catch (e) {
  // Dev build: the id drift trips the hydration guard. The throw IS the repro.
  report([
    "=== transparent memo ignored on server -> hydration id drift ===",
    "FAIL — bug reproduced: hydration mismatch from server/client id drift.",
    `dev build threw the hydration guard: ${e && e.message}`,
    "(prod build does not throw but silently drops the first update instead.)",
  ]);
}
