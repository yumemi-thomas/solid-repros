import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, Errored } from "solid-js";

function ArticleAnalytics() {
  createEffect(() => (undefined as string | undefined)!.split(/\s+/).length, {
    effect: () => {},
    error: () => {}
  });
  return (
    <article data-content>
      <h2>Hello Solid</h2>
    </article>
  );
}

function Home() {
  return (
    <main>
      <h1>Article</h1>
      <p>Expected: the analytics effect handles its own error and the article still renders.</p>
      <Errored fallback={<p data-effect-fallback>Something went wrong</p>}>
        <ArticleAnalytics />
      </Errored>
    </main>
  );
}

export const Route = createFileRoute("/")({ component: Home });
