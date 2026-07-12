// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: a <Switch> whose resolved children are null/undefined
// (no <Match> arms at all) CRASHES the server with
//   TypeError: Cannot read properties of null (reading 'when')
// because the server wraps a non-array value as [conds] then dereferences
// conds[i].when — i.e. null.when. The CLIENT runs children().toArray(), which
// maps null/undefined to [], so the match loop never runs and the fallback
// renders. So the exact tree that shows <NotFound/> in the browser takes the
// whole SSR request down.
// (A null AMONG <Match> siblings crashes BOTH sides identically — symmetric,
//  out of scope here; this is the null/undefined resolved-children case.)
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/63-switch-null-children-crash.md
import { renderToString } from "@solidjs/web";
import { Switch, Match } from "solid-js";

// A guard component: contributes Match arms only when allowed, else null.
function AdminRoutes(props) {
  return props.isAdmin ? (
    <Match when={true}>
      <p>admin panel</p>
    </Match>
  ) : null;
}

const results = [];
function check(label, ok, actual) {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} ${label}\n  server (actual): ${actual}`);
}

// Control — a real Match arm: the server renders it fine.
try {
  const html = renderToString(() => (
    <Switch fallback={<h1>Not found</h1>}>
      <AdminRoutes isAdmin={true} />
    </Switch>
  ));
  check("control: Switch with a real Match renders", /admin panel/.test(html), html);
} catch (e) {
  check("control: Switch with a real Match renders", false, `THREW ${e.message}`);
}

// Bug — guard returns null, so the Switch's resolved children are null. The
// client renders the fallback ("Not found"); the server crashes.
try {
  const html = renderToString(() => (
    <Switch fallback={<h1>Not found</h1>}>
      <AdminRoutes isAdmin={false} />
    </Switch>
  ));
  check("null children -> fallback (like the client)", /Not found/.test(html), html);
} catch (e) {
  check("null children -> fallback (like the client)", false, `THREW ${e.message}`);
}

console.log(
  results.every(Boolean)
    ? "\nPASS — bug is fixed (server falls through to the fallback like the client)"
    : "\nFAIL — bug reproduced: SSR <Switch> crashes on null/undefined resolved children while the client renders the fallback",
);
