// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: the SERVER <Portal> is a hard `throw new Error("Portal
// is not supported on the server")`, while the CLIENT has a full implementation.
// Solid 1.x rendered <Portal> on the server as a silent no-op (`return ""`), so
// any migrated SSR app with a modal / toast / tooltip goes from "works, mounts
// after hydration" to "the whole renderToString request crashes". Worse: an
// <Errored> boundary above the portal bakes the error fallback into the streamed
// HTML — users get an error page for a tree the client renders fine.
// This is a 2.0 regression. — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/65-portal-ssr-crash.md
import { renderToString, Portal } from "@solidjs/web";
import { Errored } from "solid-js";

function App() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Portal>
        <div class="toast">Saved!</div>
      </Portal>
    </main>
  );
}

// Control: the same dashboard WITHOUT the portal renders fine on the server.
function AppNoPortal() {
  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
}

const controlHtml = renderToString(() => <AppNoPortal />);
console.log("control (no Portal):", controlHtml);

let crashed = false;
let message = "";
try {
  const html = renderToString(() => <App />);
  console.log("Portal server HTML:", html);
} catch (e) {
  crashed = true;
  message = e.message;
  console.log("Portal server THREW:", message);
}

// With an <Errored> boundary above it, the crash is baked into the HTML instead
// of failing the request — the served page becomes an error page.
const withBoundary = renderToString(() => (
  <Errored fallback={(err) => <p>Something went wrong: {String(err())}</p>}>
    <App />
  </Errored>
));
console.log("with <Errored>:", withBoundary.slice(0, 140));

// Client (browser build) renders the dashboard and mounts the toast into
// document.body — the client implementation is complete.
const controlOk = controlHtml.includes("Dashboard"); // control must render
const bugReproduced = crashed && /Portal is not supported on the server/.test(message);
console.log(`\ncontrol (no Portal) rendered on server: ${controlOk ? "yes" : "NO"}`);
console.log(
  bugReproduced
    ? "\nFAIL — bug reproduced: <Portal> hard-crashed SSR (1.x rendered it as a no-op)"
    : "\nPASS — bug is fixed (server no longer throws on <Portal>)",
);
