// Client reproduction — open the StackBlitz preview; the verdict renders on the
// page (and to the console).
// SSR/client asymmetry: <Repeat> empty-detection is truthiness on the SERVER
// (`if (!len)` → undefined / NaN / 0 all render the fallback) but a strict
// `newLen === 0` on the CLIENT. So on the client:
//   • count={undefined} falls through and renders NOTHING (no rows, no
//     fallback) — SSR showed the fallback → hydration mismatch.
//   • count={NaN} falls through into `new Array(NaN)` and THROWS
//     `RangeError: Invalid array length`, halting render (white page) — while
//     SSR shipped fine fallback HTML for the same tree.
//   • count={0} (control) renders the fallback fine on both sides.
// The NaN client crash is the plain bug (SSR renders, the browser white-pages
// on it). Whether count={undefined} should show the fallback or nothing is a
// design question — but the two runtimes must at least agree.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/64-repeat-count-nan-undefined.md
import { render } from "@solidjs/web";
import { Repeat, flush } from "solid-js";

const verdict = document.getElementById("verdict");
const app = document.getElementById("app");

function mount(count) {
  const host = document.createElement("div");
  app.appendChild(host);
  try {
    render(
      () => (
        <Repeat count={count} fallback={<p>no rows</p>}>
          {i => <div>row {i}</div>}
        </Repeat>
      ),
      host
    );
    flush();
    return { html: host.innerHTML, threw: null };
  } catch (e) {
    return { html: host.innerHTML, threw: e && e.message };
  }
}

function report(lines) {
  verdict.textContent = lines.join("\n");
  console.log(lines.join("\n"));
}

const zero = mount(0); // control — should render the fallback fine
const undef = mount(undefined); // pageSize() before config loads
const nan = mount(0 / 0); // e.g. Math.floor(width / cardWidth), width undefined

// The RangeError thrown by count={NaN} IS the reproduction.
const ok = nan.threw === null;
report([
  "=== <Repeat> count NaN crashes the client; undefined renders nothing ===",
  `count={0}         (control) → html: ${JSON.stringify(zero.html)}${zero.threw ? "  THREW " + zero.threw : ""}`,
  `count={undefined}           → html: ${JSON.stringify(undef.html)}${undef.threw ? "  THREW " + undef.threw : ""}`,
  `count={NaN}                 → ${nan.threw ? "THREW " + nan.threw : "html: " + JSON.stringify(nan.html)}`,
  "",
  "(server SSR renders the fallback for undefined AND NaN — mismatch on both;",
  " the undefined-count fallback semantics is a design question, the NaN client crash is the plain bug.)",
  ok
    ? "PASS — bug fixed (count={NaN} did not crash the client)"
    : `FAIL — bug reproduced: count={NaN} throws "${nan.threw}" during render (SSR shipped fine fallback HTML for the same tree)`,
]);
