// Client (real-DOM) reproduction — open the StackBlitz preview; the verdict
// renders on the page (and to the console).
// The `$df(id)` helper emitted into every Solid 2.0 stream swaps a resolved
// fragment in by removing the fallback nodes between the `pl-X` placeholder
// template and the matching `<!--pl-X-->` end marker. Its removal loop
// terminates at the FIRST comment node of ANY kind, not at the matching marker:
//     for(;o&&8!==o.nodeType&&o.nodeValue!=="pl-"+e;)...
// When `o` is a comment, `8 !== o.nodeType` is false and the loop stops there
// regardless of nodeValue. A <Loading fallback={<>Loading {pct()}% done</>}>
// serializes with `<!--!$-->` separators between the dynamic text parts, so
// $df deletes only the fallback nodes BEFORE the first separator, replaces that
// separator with the streamed content, and leaves the rest of the fallback in
// the DOM forever — the user sees "CONTENT42% done" glued together. The
// fully-streamed-before-hydrate case never recovers.
// The markup below is the verbatim renderToStream output of that component and
// $df is the verbatim REPLACE_SCRIPT body from
// @dom-expressions/runtime@0.50.0-next.17 (src/server.js:165).
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/60-df-comment-scan-debris.md

const container = document.getElementById("app");
const verdict = document.getElementById("verdict");

globalThis._$HY = { done: false, fe() {} };

// renderToStream shell (fallback with dynamic text holes) + resolved fragment
// template, exactly as streamed:
container.innerHTML =
  '<div _hk=1><template id="pl-2"></template>Loading <!--!$-->42<!--!$-->% done<!--pl-2--></div>' +
  '<template id="2"><p _hk=2000>CONTENT</p></template>';

// verbatim $df from REPLACE_SCRIPT (@dom-expressions/runtime@0.50.0-next.17):
function $df(e, n, o, t) {
  if (!(n = document.getElementById(e)) || !(o = document.getElementById("pl-" + e))) return 0;
  for (; o && 8 !== o.nodeType && o.nodeValue !== "pl-" + e; ) (t = o.nextSibling), o.remove(), (o = t);
  _$HY.done ? o.remove() : o.replaceWith(n.content), n.remove(), _$HY.fe(e);
  return 1;
}

$df("2"); // what the stream's activation script runs when the boundary resolves

const text = container.textContent;
const html = container.innerHTML;
const ok = text === "CONTENT";

const lines = [
  "=== $df fragment swap stops at the first comment, not the matching pl-X marker ===",
  `textContent: ${JSON.stringify(text)}`,
  `innerHTML:   ${html}`,
  ok
    ? "PASS — bug fixed (fallback fully removed)"
    : "FAIL — bug reproduced: fallback debris left in the DOM",
];
verdict.textContent = lines.join("\n");
console.log(lines.join("\n"));
