import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import solid from "vite-plugin-solid";
export default defineConfig({
  server: { port: 3000 },
  plugins: [tanstackStart(), solid({ ssr: true })]
});
