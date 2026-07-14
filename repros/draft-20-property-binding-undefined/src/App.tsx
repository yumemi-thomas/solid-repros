import { createSignal, flush, Show } from "solid-js";

type Verdict = { ok: boolean; actual: string };

export default function App() {
  // A CMS-style record preview: every field is optional and cleared on deselect.
  const [html, setHtml] = createSignal<string | undefined>("<b>Hello world</b>");
  const [notes, setNotes] = createSignal<string | undefined>("Draft notes");
  const [fieldProps, setFieldProps] = createSignal<{ value: string | undefined }>({
    value: "Hello world"
  });
  const [verdict, setVerdict] = createSignal<Verdict>();

  let article!: HTMLElement;
  let notesEl!: HTMLParagraphElement;
  let titleEl!: HTMLInputElement;

  function clearSelection() {
    setHtml(undefined);
    setNotes(undefined);
    setFieldProps({ value: undefined });
    flush();

    const cases = [
      ["innerHTML", article.innerHTML],
      ["textContent", notesEl.textContent ?? ""],
      ["spread value", titleEl.value]
    ] as const;
    setVerdict({
      ok: cases.every(([, actual]) => actual === ""),
      actual: cases.map(([label, actual]) => `${label}: ${JSON.stringify(actual)}`).join("\n")
    });
  }

  return (
    <main style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Clearing property bindings to undefined</h2>
      <article ref={article} innerHTML={html()} />
      <p ref={notesEl} textContent={notes()} />
      <input ref={titleEl} {...fieldProps()} />
      <div>
        <button onClick={clearSelection} style={{ "margin-top": "12px" }}>
          clear selection
        </button>
      </div>
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
            <p>Expected every cleared binding to be "" (empty).</p>
            <pre>{v().actual}</pre>
          </section>
        )}
      </Show>
    </main>
  );
}
