// Client reproduction — open the StackBlitz preview; the verdict renders on the
// page (and to the console).
// SSR/client asymmetry: when a lazy() module promise rejects (a failed chunk
// load), the UI recovers correctly — the error is routed through the render
// memo to the nearest <Errored>, which shows its fallback. BUT the client
// lazy() ALSO attaches a bare success-only `.then()` to the module promise;
// that discarded derived promise has no rejection arm, so every failed chunk
// load ADDITIONALLY fires a global `unhandledrejection` event (phantom Sentry
// noise). The preload() path has the same leak — a caller that correctly
// `.catch()`es the returned promise STILL gets the global event.
// The SERVER lazy() was fixed for exactly this in #2780 (it attaches a
// rejection arm "instead of leaking the rejection as a process-level
// unhandledRejection"); the client copy never got the same treatment.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/50-client-lazy-unhandled-rejection.md
import { render } from "@solidjs/web";
import { lazy, flush, Errored, Loading } from "solid-js";

const verdict = document.getElementById("verdict");
const host = document.getElementById("app");

const failingImport = () =>
  Promise.reject(
    new TypeError("Failed to fetch dynamically imported module: /assets/Settings-Cf1qP2Jk.js")
  );

const rejections = [];
window.addEventListener("unhandledrejection", event => {
  rejections.push(String(event.reason));
});

function report(lines) {
  verdict.textContent = lines.join("\n");
  console.log(lines.join("\n"));
}

// 1 — render path: the UI recovers via <Errored>…
const Settings = lazy(failingImport);
render(
  () => (
    <Errored fallback={err => <p>Settings unavailable: {err().message}</p>}>
      <Loading fallback={<p>loading settings…</p>}>
        <Settings />
      </Loading>
    </Errored>
  ),
  host
);
flush();

// Give the rejected module promise a couple of ticks to surface on the global
// handler (this bug is inherently async — a minimal setTimeout is required).
setTimeout(async () => {
  const renderDom = host.innerHTML;
  const renderRejections = rejections.length;

  // 2 — preload path: the caller handles the returned promise, and STILL leaks.
  rejections.length = 0;
  const Settings2 = lazy(failingImport);
  let callerCaught = false;
  await Settings2.preload().catch(() => {
    callerCaught = true;
  });

  setTimeout(() => {
    const preloadRejections = rejections.length;
    const total = renderRejections + preloadRejections;
    report([
      "=== client lazy() fires a phantom global unhandledrejection ===",
      `render path — DOM: ${renderDom}`,
      `render path — unhandled rejections: ${renderRejections}`,
      `preload path — caller caught the failure: ${callerCaught}`,
      `preload path — unhandled rejections: ${preloadRejections}`,
      total === 0
        ? "PASS — no phantom global rejections"
        : `FAIL — bug reproduced: failed chunk loads spam unhandledrejection (${total} total) even though the UI recovered and the caller caught the preload failure`
    ]);
  }, 100);
}, 100);
