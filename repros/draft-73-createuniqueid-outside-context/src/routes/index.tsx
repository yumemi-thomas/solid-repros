import { createFileRoute } from "@tanstack/solid-router";
import { createUniqueId } from "solid-js";

let fieldId = "";
let outsideError: unknown;
try {
  fieldId = createUniqueId();
} catch (error) {
  outsideError = error;
}
function Home() {
  if (outsideError)
    return (
      <main>
        <h1>Contact form</h1>
        <p data-result="fail">
          BUG REPRODUCED — createUniqueId() threw at module scope:{" "}
          {String((outsideError as Error)?.message ?? outsideError)}
        </p>
      </main>
    );
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
