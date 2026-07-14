/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from "@tanstack/solid-router";
import { HydrationScript } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
export const Route = createRootRoute({ shellComponent: RootDocument });
function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
        <HeadContent />
        <style
          innerHTML={
            ':root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #eef2f7; }\n* { box-sizing: border-box; }\nbody { margin: 0; min-height: 100vh; background: radial-gradient(circle at top, #ffffff 0, #f5f7fb 42rem, #eef2f7 100%); }\n.repro-guide { display: grid; gap: .35rem; padding: 1.15rem clamp(1rem, 4vw, 2rem); color: #f8fafc; background: #172033; border-bottom: 4px solid #7c3aed; }\n.repro-guide strong { font-size: 1.1rem; letter-spacing: .01em; }\n.repro-guide span { color: #cbd5e1; line-height: 1.5; }\nmain { width: min(880px, calc(100% - 2rem)); margin: 2rem auto; padding: clamp(1.25rem, 4vw, 2.5rem); background: rgba(255,255,255,.96); border: 1px solid #dbe2ea; border-radius: 18px; box-shadow: 0 18px 48px rgba(15,23,42,.09); }\nh1 { margin-top: 0; font-size: clamp(1.75rem, 5vw, 2.6rem); line-height: 1.08; }\nh2 { margin-top: 1.6rem; }\np, li, aside { line-height: 1.6; }\nbutton, input { font: inherit; padding: .65rem .85rem; border: 1px solid #94a3b8; border-radius: 9px; }\nbutton { color: white; background: #4f46e5; border-color: #4f46e5; cursor: pointer; }\nsection, aside, [data-card], [data-content] { margin-block: .85rem; padding: 1rem; border: 1px solid #dbe2ea; border-radius: 12px; background: #f8fafc; }\n[data-result], #browser-verdict, [data-timing-verdict] { display: block; margin: 1.25rem 0; padding: 1rem 1.1rem; white-space: pre-wrap; font: 650 .98rem/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; border: 2px solid; border-radius: 12px; box-shadow: 0 8px 20px rgba(15,23,42,.06); }\n[data-result="pass"] { color: #14532d; background: #dcfce7; border-color: #22c55e; }\n[data-result="fail"] { color: #7f1d1d; background: #fee2e2; border-color: #ef4444; }\n[data-result="pending"] { color: #713f12; background: #fef3c7; border-color: #f59e0b; }\n[data-timing] { position: relative; margin-block: .65rem; padding: .75rem 1rem; border-left: 5px solid #8b5cf6; background: #f5f3ff; border-radius: 0 9px 9px 0; }\ncode { padding: .12rem .35rem; background: #e2e8f0; border-radius: 5px; }\n@media (max-width: 520px) { main { width: min(100% - 1rem, 880px); margin: .5rem auto; border-radius: 12px; } }'
          }
        />
        <script
          innerHTML={
            "(function(){\nvar started=performance.now(),seen=new Map(),errors=[];\nfunction message(value){return String(value&&value.message||value||'Unknown error')}\nfunction paintErrors(){var target=document.getElementById('browser-verdict');if(target&&errors.length){target.dataset.result='fail';target.textContent='BUG REPRODUCED — browser error: '+errors.join(' | ')}}\nfunction note(error){errors.push(message(error&&((error.reason!==undefined&&error.reason)||(error.error!==undefined&&error.error)||error.message||error)));paintErrors()}\nfunction record(){document.querySelectorAll('[data-timing]').forEach(function(node){var name=node.getAttribute('data-timing');if(name&&!seen.has(name))seen.set(name,Math.round(performance.now()-started))})}\nfunction updateTimelines(){document.querySelectorAll('[data-timing-verdict]').forEach(function(panel){if(panel.dataset.result!=='pending')return;var fast=(panel.dataset.fast||'').split(',').filter(Boolean),slow=(panel.dataset.slow||'').split(',').filter(Boolean),names=fast.concat(slow);if(!fast.length||!fast.every(function(name){return seen.has(name)}))return;var fastEnd=Math.max.apply(null,fast.map(function(name){return seen.get(name)}));if(!slow.length){var max=Number(panel.dataset.maxFast||700),quick=fastEnd<=max;panel.dataset.result=quick?'pass':'fail';panel.textContent=(quick?'PASS — content streamed without waiting for the discarded fallback.':'BUG REPRODUCED — content was held by work inside the discarded fallback.')+'\\n'+fast.map(function(name){return name+': '+seen.get(name)+'ms'}).join(' · ')+'\\nLatest arrival: '+fastEnd+'ms (expected by '+max+'ms).';return}if(!slow.every(function(name){return seen.has(name)}))return;var slowStart=Math.min.apply(null,slow.map(function(name){return seen.get(name)})),gap=slowStart-fastEnd,min=Number(panel.dataset.minGap||0),ok=gap>=min;panel.dataset.result=ok?'pass':'fail';panel.textContent=(ok?'PASS — expected streaming order observed.':'BUG REPRODUCED — reveal groups arrived together.')+'\\n'+names.map(function(name){return name+': '+seen.get(name)+'ms'}).join(' · ')+'\\nSeparation: '+gap+'ms (expected at least '+min+'ms).'} )}\nfunction startTimeouts(){document.querySelectorAll('[data-timeout-result]').forEach(function(panel){if(panel.dataset.timeoutStarted)return;panel.dataset.timeoutStarted='true';var delay=Number(panel.dataset.timeoutResult||1200);setTimeout(function(){if(panel.dataset.result==='pending'){panel.dataset.result='fail';panel.textContent='BUG REPRODUCED — the UI is still waiting after '+delay+'ms.'}},delay)})}\nfunction settleBrowserVerdicts(){document.querySelectorAll('#browser-verdict[data-result=\"pending\"]').forEach(function(panel){if(panel.dataset.settleStarted)return;panel.dataset.settleStarted='true';setTimeout(function(){paintErrors();if(panel.dataset.result==='pending'){panel.dataset.result='pass';panel.textContent='PASS — hydration completed without a browser error or warning.'}},900)})}\nfunction scan(){record();updateTimelines();startTimeouts();paintErrors();settleBrowserVerdicts()}\naddEventListener('error',note);addEventListener('unhandledrejection',note);\nvar originalWarn=console.warn;console.warn=function(){var text=Array.prototype.map.call(arguments,message).join(' ');if(/hydration|unclaimed/i.test(text))note(text);return originalWarn.apply(console,arguments)};\nnew MutationObserver(scan).observe(document,{subtree:true,childList:true});\nif(document.readyState==='loading')addEventListener('DOMContentLoaded',scan);else scan();\n})();"
          }
        />
      </head>
      <body>
        <header class="repro-guide">
          <strong>Visual reproduction</strong>
          <span>
            Watch the result card below: red means the pinned bug reproduced, green means expected
            behavior, and amber means the check is still running.
          </span>
        </header>
        {props.children}
        <Scripts />
      </body>
    </html>
  );
}
