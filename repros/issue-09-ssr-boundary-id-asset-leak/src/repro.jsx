// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// Streaming SSR: after a pending <Loading> boundary, the shared
// `_currentBoundaryId` is never restored, so a later ROOT-level lazy()'s module
// registration lands in the boundary's asset map instead of the root
// `_$HY.r["_assets"]` map — the root map is never emitted and the root-level
// lazy footer can never hydrate on the client. — Solid 2.0.0-beta.16
// Issue draft: issue-drafts/09-boundary-id-leak-lazy-hydration.md
import { renderToStream } from "@solidjs/web";
import { createMemo, lazy, Loading } from "solid-js";

const asyncValue = (value, ms = 10) =>
  new Promise((r) => setTimeout(() => r(value), ms));

// The manifest maps each lazy module URL to its built asset.
const manifest = {
  "./Route.tsx": { file: "assets/route.js" },
  "./Footer.tsx": { file: "assets/footer.js" },
};

const RouteComp = () => {
  const data = createMemo(async () => asyncValue("route-data", 20));
  return <div>{data()}</div>;
};
// moduleUrl (2nd arg) is normally injected by the bundler plugin.
const LazyRoute = lazy(() => asyncValue({ default: RouteComp }), "./Route.tsx");

const FooterComp = () => <footer>site footer</footer>;
const LazyFooter = lazy(() => asyncValue({ default: FooterComp }), "./Footer.tsx");

function App() {
  return (
    <html>
      <head>
        <title>Test</title>
      </head>
      <body>
        <Loading fallback={<span>Wait</span>}>
          <LazyRoute />
        </Loading>
        {/* rendered at the ROOT, AFTER the pending boundary */}
        <LazyFooter />
      </body>
    </html>
  );
}

await LazyRoute.preload();
await LazyFooter.preload();

const html = await new Promise((resolve) => {
  renderToStream(() => <App />, { manifest }).then(resolve);
});

// ./Footer.tsx was rendered at the root (outside any boundary), so its module
// MUST appear in the root asset map, serialized under key "_assets".
const scripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || []).join("\n");
const rootAssets = scripts.match(/_\$HY\.r\["_assets"\][^;]*/)?.[0] ?? "";
const allAssetMaps = [...html.matchAll(/_\$HY\.r\["([^"]*_assets)"\]=[^;]*/g)].map(
  (m) => m[0]
);

const ok = rootAssets.includes("./Footer.tsx");

console.log("=== boundary id leak: root lazy asset attribution (server-only) ===");
console.log(ok ? "PASS — bug fixed" : "FAIL — bug reproduced");
console.log('expected: root map _$HY.r["_assets"]={..."./Footer.tsx"...} present');
console.log("actual:   root _assets =", rootAssets || "(NONE emitted)");
console.log(
  "          all asset maps:",
  allAssetMaps.length ? allAssetMaps.join("  |  ") : "(none)"
);
console.log("--- full html:", html);
