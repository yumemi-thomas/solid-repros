import { createSignal, createStore, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  const [settings, setSettings] = createStore({ theme: "system", density: "compact" });
  const [verdict, setVerdict] = createSignal<Verdict>();

  function freezeAndProbe() {
    try {
      Object.freeze(settings);
    } catch {
      // acceptable: rejecting the freeze outright
    }

    // 1. ENUMERATION probe
    let enumerationOk = false;
    let enumeration: string;
    try {
      const keys = Object.keys(settings).sort().join(",");
      const spread = JSON.stringify({ ...settings });
      enumerationOk =
        keys === "density,theme" && spread === '{"theme":"system","density":"compact"}';
      enumeration = `keys=[${keys}], spread=${spread}`;
    } catch (e) {
      enumeration = `Object.keys(settings) threw: ${String(e)}`;
    }

    // 2. WRITE probe: creating the override on the now-non-extensible
    //    internal target throws.
    let writeOk = false;
    let write: string;
    try {
      setSettings(s => {
        s.theme = "dark";
      });
      flush();
      writeOk = settings.theme === "dark";
      write = `settings.theme === "${settings.theme}"`;
    } catch (e) {
      write = `setSettings threw: ${String(e)}`;
    }

    setVerdict({
      ok: enumerationOk && writeOk,
      actual: `enumeration: ${enumeration}\nwrite: ${write}`
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Object.freeze poisons the store proxy</h2>
      <p>
        theme: {settings.theme}, density: {settings.density}
      </p>
      <button onClick={freezeAndProbe}>freeze store, then enumerate and write</button>
      <Show when={verdict()}>
        {v => (
          <section
            style={{
              padding: "12px",
              "margin-top": "12px",
              color: "white",
              background: v().ok ? "#137333" : "#c5221f"
            }}
          >
            <b>{v().ok ? "PASS - bug is fixed" : "FAIL - bug reproduced"}</b>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
