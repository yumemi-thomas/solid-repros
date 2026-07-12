// Client (hydration) reproduction — open the StackBlitz preview; the verdict
// renders on the page (and to the console).
// SSR/client asymmetry: createReaction's tracking function creates an effect
// node on the CLIENT, and that node consumes one hydration child-id slot from
// the surrounding owner. The SERVER shim is a bare passthrough
// (`tracking => tracking()`) that allocates NOTHING. A component that arms a
// reaction in its body (the documented pattern) therefore shifts the hydration
// id of every subsequent sibling by one: the async memo looks up its serialized
// value under the wrong key and the `_hk` element claims miss, so the client
// leaves the whole server-rendered tree unclaimed and builds a detached
// duplicate. The neighboring server shims (createTrackedEffect, onSettled)
// already allocate a slot for parity; createReaction was missed.
//   • dev build (StackBlitz preview): the id drift trips the hydration guard
//     "Failed attempt to create new DOM elements during hydration" and/or warns
//     "Hydration completed with N unclaimed server-rendered node(s)".
//   • prod build: no throw, but bindings attach to detached DOM.
// Either way it is the same root cause: a server/client hydration-id drift.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/57-createreaction-id-slot.md
import { hydrate } from "@solidjs/web";
import { createMemo, createReaction, createSignal, flush, Loading } from "solid-js";

const container = document.getElementById("app");
const verdict = document.getElementById("verdict");

// The stream's serialization scripts install the async memo's resolved promise
// (stamped s: 1) under key "0" plus the boundary's fragment promise under
// "2_fr". With or without the reaction the server emits the IDENTICAL document
// and IDENTICAL keys — it never accounts for the reaction's slot.
globalThis._$HY = {
  events: [],
  completed: new WeakSet(),
  fe() {},
  r: {
    "0": Object.assign(Promise.resolve("42 visits"), { s: 1, v: "42 visits" }),
    "2_fr": Promise.resolve(true),
  },
};

// Exact post-swap renderToStream output of <App/> below on beta.17.
container.innerHTML = '<div _hk=1><p _hk=2000>42 visits</p></div>';

function report(lines) {
  verdict.textContent = lines.join("\n");
  console.log(lines.join("\n"));
}

// Capture the "unclaimed server-rendered node(s)" warning the prod-style path
// emits instead of throwing.
const warnings = [];
const ogWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args.join(" "));
  ogWarn.apply(console, args);
};

try {
  hydrate(() => {
    const [dirty] = createSignal(false);
    // Documented pattern: arm a reaction once in the component body. On the
    // client this consumes child-id slot 0; the server allocated nothing.
    const reaction = createReaction(() => console.log("changed"));
    reaction(() => dirty());
    const stats = createMemo(async () => "42 visits");
    return (
      <div>
        <Loading fallback={<i>loading…</i>}>
          <p>{stats()}</p>
        </Loading>
      </div>
    );
  }, container);
  flush();

  console.warn = ogWarn;
  const unclaimed = warnings.filter((w) => /unclaimed/i.test(w));
  if (unclaimed.length > 0) {
    report([
      "=== createReaction consumes a client id slot the server never allocates ===",
      "FAIL — bug reproduced: server/client hydration-id drift.",
      ...unclaimed.map((w) => `  ${w}`),
    ]);
  } else {
    report([
      "=== createReaction consumes a client id slot the server never allocates ===",
      "PASS — bug fixed (armed reaction hydrated cleanly, no unclaimed nodes).",
    ]);
  }
} catch (e) {
  // Dev build: the id drift trips the hydration guard. The throw IS the repro.
  console.warn = ogWarn;
  report([
    "=== createReaction consumes a client id slot the server never allocates ===",
    "FAIL — bug reproduced: hydration mismatch from server/client id drift.",
    `dev build threw the hydration guard: ${e && e.message}`,
    "(prod build does not throw but wires bindings to detached DOM instead.)",
  ]);
}
