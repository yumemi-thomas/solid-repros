// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: a createEffect COMPUTE-PHASE throw routes to opposite
// destinations. The client delivers it to the effect's own `error` arm (or
// console.error) and renders the content normally. The SERVER re-throws it out
// of the effect into the enclosing <Errored>, bakes the error fallback into the
// SSR HTML, and DROPS the EffectBundle entirely (the `error` arm never runs).
// Same tree → error page on hard refresh, real page on client navigation.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/47-effect-throw-ssr-fallback.md
import { renderToString } from "@solidjs/web";
import { createEffect, Errored } from "solid-js";

const armCalls = [];

function ArticleAnalytics(props) {
  // Analytics effect: the compute derives a reading time and throws on
  // edge input (an article with no body).
  createEffect(() => props.article.body.split(/\s+/).length, {
    effect: (words) => armCalls.push(`effect(${words})`),
    error: (err) => armCalls.push(`error(${err.message})`),
  });
  return (
    <article>
      <h1>{props.article.title}</h1>
    </article>
  );
}

function App() {
  const article = { title: "Hello Solid", body: undefined };
  return (
    <Errored fallback={(err) => <div>Something went wrong: {err().message}</div>}>
      <ArticleAnalytics article={article} />
    </Errored>
  );
}

const html = renderToString(() => <App />);

const renderedContent = html.includes("<article");
const renderedFallback = html.includes("Something went wrong");

console.log("=== createEffect compute throw bakes <Errored> fallback into SSR HTML (server-only) ===");
console.log("SSR HTML:", html);
console.log("bundle arms called:", JSON.stringify(armCalls));
// Client comparison (browser build) renders the content and calls the error arm:
//   client DOM: <article><h1>Hello Solid</h1></article>
//   bundle arms called: ["error(Cannot read properties of undefined (reading 'split'))"]
console.log(
  renderedContent && !renderedFallback && armCalls[0]?.startsWith("error(")
    ? "\nPASS — server matches the client (content rendered, compute error handled by the effect)"
    : "\nFAIL — bug reproduced: SSR rendered the <Errored> fallback and never called the EffectBundle error arm"
);
