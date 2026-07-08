// render() into a NON-EMPTY container appends (leaves existing children), but
// the disposer does `element.textContent = ""` and wipes the pre-existing
// content too. — Solid 2.0.0-beta.15 (and 1.x).
//
// Realistic case: a Solid widget (feedback button) mounted into a
// server-rendered article region (#content, authored in index.html). Mounting
// appends the widget after the article; unmounting should remove only the
// widget, but it blanks the whole article.
// Issue draft: issue-drafts/20-dispose-wipes-preexisting-content.md
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";

function FeedbackWidget() {
  const [n, setN] = createSignal(0);
  return (
    <p>
      <button onClick={() => setN(n() + 1)}>👍 helpful ({n()})</button>
    </p>
  );
}

export default function App() {
  const [mounted, setMounted] = createSignal(false);
  const [articleGone, setArticleGone] = createSignal(false);
  let dispose;

  const content = () => document.getElementById("content");

  function mount() {
    // Appends into the server-rendered article (the container is non-empty).
    dispose = render(() => <FeedbackWidget />, content());
    setMounted(true);
  }
  function unmount() {
    dispose?.();
    dispose = undefined;
    setMounted(false);
    setArticleGone(!content().querySelector("h1")); // did the article survive?
  }

  return (
    <section style={{ padding: "16px" }}>
      <h2>Mount a widget into the server-rendered article</h2>
      <button onClick={mount} disabled={mounted()}>mount widget</button>{" "}
      <button onClick={unmount} disabled={!mounted()}>unmount widget</button>
      <p style={{ color: articleGone() ? "#c5221f" : "#666" }}>
        {articleGone()
          ? "FAIL — unmounting the widget also wiped the server-rendered article above."
          : "Mount appends the 👍 widget inside the article above; unmount should remove only the widget."}
      </p>
    </section>
  );
}
