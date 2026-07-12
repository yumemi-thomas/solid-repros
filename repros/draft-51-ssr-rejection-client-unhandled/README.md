# draft-51 — SSR-side async rejection leaks unhandled promises into the browser

SSR/client asymmetry (Solid **2.0.0-beta.17**). When an async memo rejects during
SSR, seroval's reject-replay (in the streamed `<script>`s) rejects `_$HY.r["0"]`
and `_$HY.r["<key>_fr"]` at parse time. The client attaches handlers only on the
pending-promise hydration branch, so in the "loaded" case (full stream arrived
before hydrate) nobody handles them → two phantom `unhandledrejection` events.
The UI still recovers to the `<Errored>` fallback; the rejections are pure
error-tracker noise.

Run: `npm run dev` and open the preview — the verdict (and rejection count) renders on the page.

Issue draft: `issue-drafts/51-ssr-rejection-client-unhandled.md`
