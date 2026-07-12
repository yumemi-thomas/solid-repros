// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: server merge() drops symbol-keyed props from a FUNCTION
// source (the proxy path). They vanish from Reflect.ownKeys and from spreads,
// while a direct read props[SYM] still works. The client keeps them (#2769).
// Scope: the asymmetry is proxy-path only. A plain-object-only merge drops the
// symbol on BOTH sides, so that stays symmetric — shown below as the control.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/67-merge-symbol-keys.md
import { merge } from "solid-js";

const THEME = Symbol.for("ui.theme");

// A design-system component merges reactive defaults (carrying a symbol-keyed
// theme prop) into incoming props. The function source routes through the proxy.
const props = merge(() => ({ [THEME]: "dark", size: "md" }), { size: "lg" });
const spread = { ...props };
const keys = Reflect.ownKeys(props).map(String);

// client (expected): keys include Symbol(ui.theme); spread[THEME] === "dark"
const symbolEnumerated = keys.includes("Symbol(ui.theme)");
const symbolSpread = spread[THEME] === "dark";
const ok = symbolEnumerated && symbolSpread;

console.log(`Reflect.ownKeys(props): ${keys.join(", ")}`);
console.log(`  spread[THEME]:      ${String(spread[THEME])}`);
console.log(`  direct props[THEME]: ${String(props[THEME])}  (works on both sides)`);

// Control: plain-object-only merge is symmetric — symbol dropped everywhere.
const plain = merge({ [THEME]: "dark" }, { size: "lg" });
console.log(`\ncontrol plain-object merge ownKeys: ${Reflect.ownKeys(plain).map(String).join(", ")}  (symmetric)`);

console.log(
  "\n=== server merge() drops symbol props from function sources (#2769 not ported) ===",
);
console.log(
  ok
    ? "PASS — bug is fixed (server enumerates symbol props from function sources)"
    : `FAIL — bug reproduced: symbol dropped from function source (enumerated=${symbolEnumerated}, in spread=${symbolSpread})`,
);
