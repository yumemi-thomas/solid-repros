import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// SSR reproduction: src/repro.jsx runs under Node via vite-node with the server
// generator, so solid-js/@solidjs/web resolve to their server builds (where the
// bug lives) and renderToString runs the server <Switch>.
export default defineConfig({
  plugins: [solid({ solid: { generate: "ssr", hydratable: true } })],
  resolve: { conditions: ["node", "solid", "import", "module", "default"] },
});
