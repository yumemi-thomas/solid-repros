import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// hot: false disables solid-refresh (HMR) — irrelevant for a repro, and its
// dependency-scanner can miscompile components that call render()/hydrate() in dev.
export default defineConfig({
  plugins: [solid({ hot: false })],
});
