// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR swallows FALSY async rejections: an async createMemo that rejects with
// `undefined` / `""` inside <Loading> + <Errored> renders its CHILDREN as if
// resolved, instead of the <Errored> fallback. A real Error correctly reaches
// the fallback (control). — Solid 2.0.0-beta.15
// Issue draft: issue-drafts/06-ssr-falsy-rejection-swallowed.md
import { renderToStringAsync } from "@solidjs/web";
import { createMemo, Loading, Errored } from "solid-js";

function App(props) {
  const data = createMemo(async () => {
    await new Promise((r) => setTimeout(r, 10));
    throw props.reason; // e.g. a bare `Promise.reject()` from a fetch layer
  });
  return (
    <Loading fallback={<span>Loading...</span>}>
      <Errored fallback={() => <span>caught!</span>}>
        <p>value:{data()}</p>
      </Errored>
    </Loading>
  );
}

// control — a real Error correctly reaches the <Errored> fallback
const control = await renderToStringAsync(() => <App reason={new Error("boom")} />);
// bug — `throw undefined` (bare Promise.reject) MUST also reach the fallback
const bug = await renderToStringAsync(() => <App reason={undefined} />);

const controlOk = control.includes("caught!");
// The fallback should render ("caught!") and the children ("value:") must NOT.
const ok = bug.includes("caught!") && !bug.includes("value:");

console.log("=== SSR falsy async rejection swallowed (server-only) ===");
console.log(ok ? "PASS — bug fixed" : "FAIL — bug reproduced");
console.log("expected: control + bug both render <Errored> ('caught!'), no 'value:'");
console.log(
  `actual:   control caught=${controlOk} | bug caught=${bug.includes("caught!")} | bug rendered-children(value:)=${bug.includes("value:")}`
);
console.log("--- control html (Error, correct):", control);
console.log("--- bug html (throw undefined):    ", bug);
