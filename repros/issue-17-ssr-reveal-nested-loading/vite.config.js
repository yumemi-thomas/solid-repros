import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// SSR reproduction: the entry (src/repro.jsx) calls renderToStringAsync /
// renderToStream and runs under Node via vite-node, so the Solid JSX must be
// compiled with the server generator.
export default defineConfig({
  plugins: [solid({ solid: { generate: "ssr", hydratable: true } })],
});
