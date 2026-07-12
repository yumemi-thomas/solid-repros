// Client (hydration) reproduction — open the StackBlitz preview; the verdict
// renders on the page. SSR/client asymmetry: every SSR-side async rejection
// leaves UNHANDLED promise rejections in the browser. seroval's reject-replay
// (in the streamed <script>s below) rejects _$HY.r["0"] and _$HY.r["200_fr"] at
// parse time; the client only attaches handlers on the pending-promise hydration
// branch, so in the loaded case (full stream arrived before hydrate) nobody
// handles them. The UI still recovers to the <Errored> fallback — the phantom
// rejections are pure error-tracker noise. — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/51-ssr-rejection-client-unhandled.md
import { hydrate } from "@solidjs/web";
import { createMemo, flush, Errored, Loading } from "solid-js";

// Exact beta.17 renderToStream output of the App below (captured verbatim):
const shell = "<div _hk=1><template id=\"pl-200\"></template><b _hk=2000>loading reviews…</b><!--pl-200--></div><script>(self.$R=self.$R||{})[\"\"]=[];_$HY.r[\"0\"]=$R[0]=($R[1]=($R[2]=()=>{let e={p:0,s:0,f:0};return e.p=new Promise((r,t)=>{e.s=r,e.f=t}),e})()).p;_$HY.r[\"200_fr\"]=$R[3]=($R[4]=$R[2]()).p;</script>";
const rest = "<template id=\"200\"> </template><script>($R[6]=(e,r)=>{e.f(r),e.p.s=2,e.p.v=r})($R[1],$R[5]=Object.assign(new Error(\"review service unavailable\"),{stack:\"Error: review service unavailable\\n    at Object.compute (app.jsx:6:66)\"}));$df(\"200\");function $df(e,n,o,t){if(!(n=document.getElementById(e))||!(o=document.getElementById(\"pl-\"+e)))return 0;for(;o&&8!==o.nodeType&&o.nodeValue!==\"pl-\"+e;)t=o.nextSibling,o.remove(),o=t;_$HY.done?o.remove():o.replaceWith(n.content),n.remove(),_$HY.fe(e);return 1}function $dfl(e,o,n){if(!(o=document.getElementById(\"pl-\"+e)))return 0;if(o._$fl)return 1;for(n=o.nextSibling;n;){if(8===n.nodeType&&n.nodeValue===\"pl-\"+e){o.parentNode&&o.parentNode.insertBefore(o.content.cloneNode(!0),n),o._$fl=1;return 1}n=n.nextSibling}return 0}function $dflj(e,i){for(i=0;i<e.length;i++)$dfl(e[i])}function $dfs(e,c,d){(_$HY.sc=_$HY.sc||{})[e]=c,d&&((_$HY.sd=_$HY.sd||{})[e]=1)}function $dfg(e,g,i,k){if(!(g=_$HY.sg&&_$HY.sg[e]))return;for(i=0;i<g.length;i++)if(_$HY.sc&&_$HY.sc[g[i]]>0)return;for(i=0;i<g.length;i++)k=g[i],delete _$HY.sg[k],$df(k)}function $dfc(e){if(--_$HY.sc[e]<=0){delete _$HY.sc[e],_$HY.sg&&_$HY.sg[e]?$dfg(e):!(_$HY.sd&&_$HY.sd[e])&&$df(e);_$HY.sd&&delete _$HY.sd[e]}}function $dfj(e,i,n){for(i=0;i<e.length;i++)if(_$HY.sc&&_$HY.sc[e[i]]>0){for(n=0;n<e.length;n++)(_$HY.sg=_$HY.sg||{})[e[n]]=e;return}for(i=0;i<e.length;i++)$df(e[i])};$R[6]($R[4],$R[5]);</script>";

const container = document.getElementById("app");
const verdict = document.getElementById("verdict");
const reasons = [];
window.addEventListener("unhandledrejection", (e) => {
  reasons.push(String(e.reason && e.reason.message ? e.reason.message : e.reason));
  e.preventDefault();
});
globalThis._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };

function applyChunk(html, first) {
  const scriptRe = /<script(?:[^>]*)>([\s\S]*?)<\/script>/g;
  const scripts = [...html.matchAll(scriptRe)].map((m) => m[1]);
  const stripped = html.replace(scriptRe, "");
  if (first) container.innerHTML = stripped;
  else container.insertAdjacentHTML("beforeend", stripped);
  for (const s of scripts) (0, eval)(s);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function App() {
  const review = createMemo(async () => {
    await sleep(15);
    throw new Error("review service unavailable");
  });
  return (
    <div>
      <Errored fallback={(err) => <i>Reviews unavailable: {err().message}</i>}>
        <Loading fallback={<b>loading reviews…</b>}>
          <p>{review()}</p>
        </Loading>
      </Errored>
    </div>
  );
}

// Loaded mode: the full stream arrived before hydration (fast network).
applyChunk(shell, true);
applyChunk(rest, false);
hydrate(() => <App />, container);
flush();

(async () => {
  await sleep(140);
  flush();
  await sleep(140);
  const ok = reasons.length === 0;
  const lines = [
    "=== SSR-side async rejection leaks unhandled promises into the browser ===",
    "hydrated DOM: " + container.innerHTML,
    "unhandled rejections: " + reasons.length + " " + JSON.stringify(reasons),
    ok
      ? "PASS — no phantom rejections"
      : "FAIL — bug reproduced: the SSR-side async rejection leaked " + reasons.length + " unhandled promise rejection(s) into the browser (pure error-tracker noise; the client refetch/Errored path handles the real error separately)",
  ];
  verdict.textContent = lines.join("\n");
  console.log(lines.join("\n"));
})();
