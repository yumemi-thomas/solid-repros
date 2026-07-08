import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  // hot: false disables solid-refresh (HMR) — irrelevant for a repro, and its
  // dependency-scanner miscompiles components that call render() (emits a
  // reserved `import` identifier in the deps object).
  plugins: [solid({ hot: false })],
});
