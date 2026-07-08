// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// lazy() inside <NoHydration> silently renders NOTHING during SSR. The
// moduleUrl/manifest guards are correctly waived for no-hydrate zones, but the
// server lazy() wrapper bails out before creating the render memo, so the
// resolved content is dropped — leaving an empty hole. — Solid 2.0.0-beta.15
// Issue draft: issue-drafts/08-nohydration-lazy-renders-nothing.md
import { renderToStringAsync, NoHydration } from "@solidjs/web";
import { lazy } from "solid-js";

const StaticFooter = lazy(async () => ({
  default: () => <p>static lazy content</p>,
}));

function App() {
  return (
    <NoHydration>
      <div>
        before-
        <StaticFooter />
        -after
      </div>
    </NoHydration>
  );
}

const html = await renderToStringAsync(() => <App />);

// The lazy component's content must appear in the static HTML.
const ok = html.includes("static lazy content");

console.log("=== lazy() inside <NoHydration> renders nothing (server-only) ===");
console.log(ok ? "PASS — bug fixed" : "FAIL — bug reproduced");
console.log("expected: <div>before-…<p>static lazy content</p>…-after</div>");
console.log("actual html:", html);
