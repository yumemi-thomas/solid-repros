// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: createUniqueId() called OUTSIDE a reactive context
// (module scope, event handlers, non-component utilities) diverges per side:
//   server: THROWS "createUniqueId cannot be used outside of a reactive context"
//   client: falls back to a counter id — "cl-0", "cl-1", ...
// The throw IS the reproduction. (1x check: 1.x server ALSO threw here, so this
// is a long-standing asymmetry, not a 2.0 regression — filed for parity/docs.)
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/73-createuniqueid-outside-context.md
import { createUniqueId } from "solid-js";

// Module-scope id generation in a shared library (label/input pairing, aria ids…)
// Client (expected): PASS — returns a "cl-N" fallback id.
try {
  const formId = createUniqueId();
  console.log("PASS — createUniqueId() returned:", formId);
  console.log("\n=== createUniqueId() outside a reactive context (server-only) ===");
  console.log("PASS — bug is fixed (server has an out-of-context fallback)");
} catch (e) {
  console.log("FAIL — createUniqueId() threw:", e.message);
  console.log("\n=== createUniqueId() outside a reactive context (server-only) ===");
  console.log(
    "FAIL — bug reproduced: server throws where the client returns a cl-N fallback id"
  );
}
