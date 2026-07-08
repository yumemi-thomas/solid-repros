import { createEffect, createSignal } from "solid-js";

// Minimal example repro. Replace the body of App with the smallest
// reproduction of the bug you are filing. Keep it to a single file when
// possible and show the observed vs. expected behaviour on screen or in the
// console.
export default function App() {
  const [count, setCount] = createSignal(0);

  createEffect(() => {
    console.log("count is", count());
  });

  return (
    <div style={{ "font-family": "sans-serif", padding: "1rem" }}>
      <h1>issue-1234 — signal batch</h1>
      <p>Describe the expected vs. actual behaviour here.</p>
      <button onClick={() => setCount(count() + 1)}>count: {count()}</button>
    </div>
  );
}
