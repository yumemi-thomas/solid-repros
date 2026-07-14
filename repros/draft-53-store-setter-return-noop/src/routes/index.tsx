import { createFileRoute } from "@tanstack/solid-router";
import { createStore, untrack } from "solid-js";

function Home() {
  const [state, setState] = createStore({
    todos: [
      { title: "Ship beta", done: false },
      { title: "Old draft", done: true },
      { title: "Write docs", done: false }
    ]
  });
  untrack(() => setState(current => ({ todos: current.todos.filter(todo => !todo.done) })));
  const ok = state.todos.length === 2;
  return (
    <main>
      <h1>Open tasks</h1>
      <ul>
        {state.todos.map(todo => (
          <li>{todo.title}</li>
        ))}
      </ul>
      <p data-result={ok ? "pass" : "fail"}>
        {ok ? "PASS" : "FAIL"} — completed tasks {ok ? "were removed" : "remain in SSR output"}.
      </p>
    </main>
  );
}
export const Route = createFileRoute("/")({ component: Home });
