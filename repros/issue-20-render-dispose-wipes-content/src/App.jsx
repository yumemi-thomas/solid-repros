// render() into a NON-EMPTY container appends (leaves existing children), but
// the disposer does `element.textContent = ""` and wipes the pre-existing
// content too. — Solid 2.0.0-beta.15 (and 1.x). Click "mount widget" then
// "dispose widget": the bordered region's static <p> vanishes.
// Issue draft: issue-drafts/20-dispose-wipes-preexisting-content.md
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";

export default function App() {
  const [log, setLog] = createSignal("(widget not mounted yet)");
  const [verdict, setVerdict] = createSignal();
  let host;
  let dispose;

  const sample = () => setLog(host.innerHTML || "(container is empty)");

  function mountWidget() {
    if (dispose) return;
    dispose = render(() => <span>widget content</span>, host);
    sample();
  }

  function disposeWidget() {
    if (!dispose) return;
    dispose();
    dispose = undefined;
    setVerdict({ ok: host.querySelector("p") !== null });
    sample();
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>render() dispose wipes pre-existing content</h2>

      <button onClick={mountWidget}>mount widget</button>{" "}
      <button onClick={disposeWidget}>dispose widget</button>

      {/* stands in for server-generated / hand-written page markup: the
          static <p> exists before render() ever touches the container */}
      <div
        ref={(el) => {
          host = el;
          el.innerHTML = "<p>pre-existing static content</p>";
        }}
        style={{ border: "1px solid #999", padding: "12px", margin: "12px 0" }}
      />

      <Show when={verdict()}>
        {(v) => (
          <div
            style={{
              padding: "12px",
              "border-radius": "8px",
              color: "#fff",
              background: v().ok ? "#137333" : "#c5221f",
            }}
          >
            <strong>{v().ok ? "PASS — bug is fixed" : "FAIL — bug reproduced"}</strong>
          </div>
        )}
      </Show>

      <pre>host.innerHTML: {log()}</pre>
    </main>
  );
}
