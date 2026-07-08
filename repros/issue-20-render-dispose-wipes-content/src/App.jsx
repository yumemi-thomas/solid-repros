// render() into a NON-EMPTY container appends, but the disposer does
// `element.textContent = ""` and wipes the whole container. — Solid 2.0.0-beta.15 (and 1.x).
//
// Realistic case: an imperative toast/overlay mounted onto document.body (which
// already contains the app in #root — i.e. a non-empty container). Dismissing
// the toast should remove only the toast, but it blanks document.body, taking
// the entire app down with it.
// Issue draft: issue-drafts/20-dispose-wipes-preexisting-content.md
import { render } from "@solidjs/web";

function Toast(props) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        padding: "12px 16px",
        background: "#137333",
        color: "#fff",
        "border-radius": "8px",
        "box-shadow": "0 2px 8px rgba(0,0,0,.3)",
      }}
    >
      Saved!
      <button onClick={props.onDismiss} style={{ "margin-left": "8px" }}>
        dismiss
      </button>
    </div>
  );
}

export default function App() {
  let toastDispose;

  function showToast() {
    if (toastDispose) return;
    // document.body already holds the app (#root) — it is a non-empty container.
    toastDispose = render(() => <Toast onDismiss={dismiss} />, document.body);
  }

  function dismiss() {
    toastDispose?.();
    toastDispose = undefined;
    // The disposer ran `document.body.textContent = ""`, so #root (the whole
    // app) is gone too. Re-render a verdict into the now-empty body to show it.
    if (!document.getElementById("root")) {
      render(
        () => (
          <p style={{ "font-family": "system-ui", padding: "16px", color: "#c5221f" }}>
            <b>FAIL — dismissing the toast wiped the entire app.</b> render()'s
            disposer did <code>document.body.textContent = ""</code>, removing
            #root and everything else — not just the toast it added.
          </p>
        ),
        document.body
      );
    }
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h1>Acme Dashboard</h1>
      <p>The whole app lives in #root. A toast on document.body must not take it down.</p>
      <button onClick={showToast}>Save (show toast)</button>
    </main>
  );
}
