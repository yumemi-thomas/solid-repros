import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, merge } from "solid-js";

const THEME = Symbol.for("ui.theme");
function Home() {
  const result = createMemo(() => {
    const props = merge(() => ({ [THEME]: "dark", size: "md" }), { size: "lg" });
    const spread = { ...props } as any;
    return { theme: spread[THEME], keys: Reflect.ownKeys(props).map(String) };
  });
  const ok = () => result().theme === "dark" && result().keys.includes("Symbol(ui.theme)");
  return (
    <main>
      <h1>Design-system props</h1>
      <p>Spread theme: {String(result().theme)}</p>
      <p>Keys: {result().keys.join(", ")}</p>
      <p data-result={ok() ? "pass" : "fail"}>
        {ok() ? "PASS" : "FAIL"} — symbol metadata {ok() ? "survived" : "was dropped"}.
      </p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
