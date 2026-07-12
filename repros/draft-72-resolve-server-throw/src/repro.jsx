// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: resolve() — the documented way to await the first
// settled value of a reactive expression — has a real CLIENT implementation but
// THROWS synchronously on the SERVER: "resolve is not implemented on the server".
// The throw IS the reproduction. Note the types always resolve the client d.ts
// (resolve<T>(fn) => Promise<T>), so TypeScript gives no compile-time warning —
// the first signal is this runtime crash during SSR.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/72-resolve-server-throw.md
import { resolve } from "solid-js";

// Shared data helper: await the first settled value of a reactive expression.
// Client (expected): PASS — resolve() settles with "Ada".
async function main() {
  try {
    const first = await resolve(() => ({ name: "Ada" }).name);
    console.log("PASS — resolve() settled with:", first);
    console.log("\n=== resolve() on the server (server-only) ===");
    console.log("PASS — bug is fixed (resolve is implemented on the server)");
  } catch (e) {
    console.log("FAIL — resolve() threw:", e.message);
    console.log("\n=== resolve() on the server (server-only) ===");
    console.log(
      "FAIL — bug reproduced: server resolve() throws where the client returns a Promise<T>"
    );
  }
}

main();
