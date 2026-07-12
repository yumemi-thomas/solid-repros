// Client (hydration) reproduction — open the StackBlitz preview; the verdict
// renders on the page. SSR/client asymmetry: a deferStream server render writes
// the RAW resolved value into _$HY.r[id] (see the emitted script below), sharing
// the namespace with promise envelopes and with NO discriminator. The client's
// readHydratedValue then sniffs .s/.v on whatever it loads:
//   • a user payload shaped { s: 2, v } is misread as a REJECTED-promise envelope
//     → the client throws a StatusError wrapping v;
//   • a payload shaped { v } is silently unwrapped to its .v (data corruption).
// The markup + _$HY entries below are the VERBATIM beta.17 server output for the
// matching component, so hydration lines up and the value-read path is exercised.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/59-readhydratedvalue-envelope.md
// Related: issue-drafts/26-hydration-nullish-serialized-value.md (same function).
import { hydrate } from "@solidjs/web";
import { createMemo, flush, Loading } from "solid-js";

const verdict = document.getElementById("verdict");
const lines = ["=== readHydratedValue mis-sniffs {s,v}/{v}-shaped user payloads ==="];

// Verbatim beta.17 renderToStream output of the App below for each payload:
const OUT_SV = "<p _hk=1000>payload</p><script>(self.$R=self.$R||{})[\"\"]=[];_$HY.r[\"1_fr\"]=$R[0]=($R[1]=($R[2]=()=>{let e={p:0,s:0,f:0};return e.p=new Promise((r,t)=>{e.s=r,e.f=t}),e})()).p;_$HY.r[\"0\"]=($R[3]={s:2,v:\"payload\"});($R[4]=(e,r)=>{e.s(r),e.p.s=1,e.p.v=r})($R[1],!0);</script>";
const OUT_V = "<p _hk=1000>inner</p><script>(self.$R=self.$R||{})[\"\"]=[];_$HY.r[\"1_fr\"]=$R[0]=($R[1]=($R[2]=()=>{let e={p:0,s:0,f:0};return e.p=new Promise((r,t)=>{e.s=r,e.f=t}),e})()).p;_$HY.r[\"0\"]=($R[3]={v:\"inner\"});($R[4]=(e,r)=>{e.s(r),e.p.s=1,e.p.v=r})($R[1],!0);</script>";

function probe(label, value, fullOutput) {
  const m = fullOutput.match(/^([\s\S]*?)<script[^>]*>([\s\S]*?)<\/script>/);
  const html = m[1];
  const script = m[2];
  const container = document.body.appendChild(document.createElement("div"));
  globalThis._$HY = { events: [], completed: new WeakSet(), fe() {}, r: {} };
  container.innerHTML = html;
  (0, eval)(script); // populates _$HY.r["0"] with the RAW value + resolves the fragment

  // Capture the memo accessor from inside the (matching) hydrated component so we
  // can read the value the client reconstructed for it — that is where the bug is
  // (the rendered TEXT looks fine because hydration reuses the server DOM).
  let data;
  let dispose = () => {};
  dispose = hydrate(() => {
    data = createMemo(async () => value, { deferStream: true });
    return (
      <Loading fallback={<i>wait</i>}>
        <p>{String(data()?.v)}</p>
      </Loading>
    );
  }, container);
  flush();

  const expected = "returned " + JSON.stringify(value);
  let observed;
  try {
    observed = "returned " + JSON.stringify(data());
  } catch (e) {
    observed = "threw " + String(e && e.message ? e.message : e);
  }
  lines.push(label + ": " + (observed === expected ? "PASS" : "FAIL — expected " + expected + ", but " + observed));
  dispose();
  container.remove();
}

probe("payload { s: 2, v }", { s: 2, v: "payload" }, OUT_SV);
probe("payload { v }", { v: "inner" }, OUT_V);

const bug = lines.some((l) => l.includes("FAIL"));
lines.push(
  bug
    ? "\nFAIL — bug reproduced: raw hydration value mis-sniffed as a promise envelope (throw for {s,v}; corruption for {v})"
    : "\nPASS — bug fixed (raw values not treated as envelopes)",
);
verdict.textContent = lines.join("\n");
console.log(lines.join("\n"));
