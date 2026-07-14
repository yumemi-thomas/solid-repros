/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from "@tanstack/solid-router";
import { HydrationScript } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

const styles = `:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#172033;background:#eef2f7}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#fff 0,#f5f7fb 42rem,#eef2f7 100%)}.repro-guide{display:grid;gap:.35rem;padding:1.15rem clamp(1rem,4vw,2rem);color:#f8fafc;background:#172033;border-bottom:4px solid #7c3aed}.repro-guide span{color:#cbd5e1;line-height:1.5}main{width:min(880px,calc(100% - 2rem));margin:2rem auto;padding:clamp(1.25rem,4vw,2.5rem);background:#fff;border:1px solid #dbe2ea;border-radius:18px;box-shadow:0 18px 48px rgba(15,23,42,.09)}p{line-height:1.6}section,aside{margin-block:.85rem;padding:1rem;border:1px solid #dbe2ea;border-radius:12px;background:#f8fafc}[data-result],[data-timing-verdict]{display:block;margin:1.25rem 0;padding:1rem 1.1rem;white-space:pre-wrap;font:650 .98rem/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;border:2px solid;border-radius:12px}[data-result=pass]{color:#14532d;background:#dcfce7;border-color:#22c55e}[data-result=fail]{color:#7f1d1d;background:#fee2e2;border-color:#ef4444}[data-result=pending]{color:#713f12;background:#fef3c7;border-color:#f59e0b}[data-timing]{border-left:5px solid #8b5cf6}`;

const observer = `(function(){var started=performance.now(),seen=new Map();function scan(){document.querySelectorAll('[data-timing]').forEach(function(node){var name=node.getAttribute('data-timing');if(name&&!seen.has(name))seen.set(name,Math.round(performance.now()-started))});document.querySelectorAll('[data-timing-verdict]').forEach(function(panel){if(panel.dataset.result!=='pending')return;var fast=(panel.dataset.fast||'').split(',').filter(Boolean),slow=(panel.dataset.slow||'').split(',').filter(Boolean),all=fast.concat(slow);if(!all.every(function(name){return seen.has(name)}))return;var fastEnd=Math.max.apply(null,fast.map(function(name){return seen.get(name)})),slowStart=Math.min.apply(null,slow.map(function(name){return seen.get(name)})),gap=slowStart-fastEnd,min=Number(panel.dataset.minGap||0),ok=gap>=min;panel.dataset.result=ok?'pass':'fail';panel.textContent=(ok?'PASS — expected independent reveal timing observed.':'BUG REPRODUCED — Errored-wrapped payment held the order summary.')+'\\n'+all.map(function(name){return name+': '+seen.get(name)+'ms'}).join(' · ')+'\\nSeparation: '+gap+'ms (expected at least '+min+'ms).'})}new MutationObserver(scan).observe(document,{subtree:true,childList:true});if(document.readyState==='loading')addEventListener('DOMContentLoaded',scan);else scan()})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start × Solid 2.0 — Reveal nested Loading repro" }
    ]
  }),
  shellComponent: RootDocument
});

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html>
      <head>
        <HydrationScript />
        <HeadContent />
        <style innerHTML={styles} />
        <script innerHTML={observer} />
      </head>
      <body>
        <header class="repro-guide">
          <strong>Visual reproduction</strong>
          <span>
            Watch the timeline below: red means the pinned bug reproduced, green means expected
            behavior, and amber means the check is still running.
          </span>
        </header>
        {props.children}
        <Scripts />
      </body>
    </html>
  );
}
