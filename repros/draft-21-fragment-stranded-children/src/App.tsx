import { createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

// Stand-in for an external parser (markdown, sanitizer, rich-text editor)
// that returns its output as a DocumentFragment.
function parseToFragment(a: string, b: string) {
  const frag = document.createDocumentFragment();
  const i1 = document.createElement("i");
  i1.textContent = a;
  const i2 = document.createElement("i");
  i2.textContent = b;
  frag.append(i1, i2);
  return frag;
}

export default function App() {
  const [preview, setPreview] = createSignal<any>(parseToFragment("1", "2"));
  const [comment, setComment] = createSignal<any>(parseToFragment("1", "2"));
  const [verdict, setVerdict] = createSignal<Verdict>();

  let previewEl!: HTMLDivElement;
  let commentEl!: HTMLDivElement;

  function replaceContent() {
    setPreview("x"); // fragment → text
    setComment(parseToFragment("3", "4")); // fragment → fragment
    flush();

    const cases = [
      { label: "fragment -> text", expected: "beforexafter", actual: previewEl.textContent },
      { label: "fragment -> fragment", expected: "before34after", actual: commentEl.textContent }
    ];
    setVerdict({
      ok: cases.every(c => c.actual === c.expected),
      actual: cases
        .map(
          c =>
            `${c.label}: expected ${JSON.stringify(c.expected)}, actual ${JSON.stringify(c.actual)}`
        )
        .join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>DocumentFragment in a reactive slot</h2>
      <div ref={previewEl}>
        <span>before</span>
        {preview()}
        <span>after</span>
      </div>
      <div ref={commentEl}>
        <span>before</span>
        {comment()}
        <span>after</span>
      </div>
      <button onClick={replaceContent} style={{ "margin-top": "12px" }}>
        replace content
      </button>
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
