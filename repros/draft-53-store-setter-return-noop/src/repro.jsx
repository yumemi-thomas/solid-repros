// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: the store setter's documented RETURN-form —
// `setState(s => nextValue)` — is a silent no-op on the SERVER. The server
// setter is `(fn) => fn(state)`: it calls the callback and discards the return,
// so isomorphic init code (dedupe/filter/replace before render) renders
// PRE-update state on the server and post-update state on the client → wrong
// first paint + hydration mismatch. This is a REGRESSION: Solid 1.x honored the
// return-form on BOTH sides. — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/53-store-setter-return-noop.md
import { createStore } from "solid-js";
import { renderToString } from "@solidjs/web";

const seed = () => ({
  todos: [
    { id: 1, title: "Ship beta", done: false },
    { id: 2, title: "Old draft", done: true },
    { id: 3, title: "Write docs", done: false },
  ],
});

// The bug: isomorphic init drops completed todos with the DOCUMENTED return-form
// (the callback returns the next top-level value). The server discards it.
function ReturnForm() {
  const [state, setState] = createStore(seed());
  setState((s) => ({ todos: s.todos.filter((t) => !t.done) }));
  return <ul>{state.todos.map((t) => <li>{t.title}</li>)}</ul>;
}

// Control: the MUTATION-form (mutate the draft in place) DOES work on the server,
// proving the resolver is on the server build and only the return-form is lost.
function MutationForm() {
  const [state, setState] = createStore(seed());
  setState((s) => {
    s.todos = s.todos.filter((t) => !t.done);
  });
  return <ul>{state.todos.map((t) => <li>{t.title}</li>)}</ul>;
}

const returnHtml = renderToString(() => <ReturnForm />);
const mutationHtml = renderToString(() => <MutationForm />);

// Client (browser build) honors the return-form: "Old draft" is dropped.
const expectDropped = "Old draft"; // must NOT appear once the setter is honored
const returnOk = !returnHtml.includes(expectDropped);
const controlOk = !mutationHtml.includes(expectDropped);

console.log("return-form server HTML:  ", returnHtml);
console.log("mutation-form server HTML:", mutationHtml, "(control)");
console.log(
  `\ncontrol (mutation-form) dropped completed todo on server: ${controlOk ? "yes" : "NO"}`,
);
console.log(
  `client (expected) drops "${expectDropped}" via return-form; server dropped it: ${returnOk ? "yes" : "NO"}`,
);
console.log(
  returnOk
    ? "\nPASS — bug is fixed (server honors the return-form setter)"
    : '\nFAIL — bug reproduced: return-form setter was a silent no-op on the server (kept "Old draft")',
);
