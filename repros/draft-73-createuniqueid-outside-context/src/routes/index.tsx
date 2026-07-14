import { createFileRoute } from "@tanstack/solid-router";
import { createUniqueId } from "solid-js";

const fieldId = createUniqueId();
function Home() {
  return (
    <main>
      <h1>Contact form</h1>
      <label for={fieldId}>Email</label>
      <input id={fieldId} />
      <p data-result="pass">PASS — shared module created id {fieldId}.</p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
