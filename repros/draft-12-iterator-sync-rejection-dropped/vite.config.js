import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  // hot: false disables solid-refresh (HMR) — irrelevant for a repro, and its
  // dependency-scanner can miscompile some components in dev.
  plugins: [solid({ hot: false })],
});
