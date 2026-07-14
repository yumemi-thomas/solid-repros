// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// Streaming SSR: nesting a <Reveal> whose children register no async fragments
// under a <Reveal order="together"> permanently deadlocks the outer group. The
// empty/all-sync nested Reveal reports "fully resolved" but never "minimally
// resolved", so the together group's release condition is unsatisfiable and its
// $dfj activation is NEVER emitted — the article skeleton stays forever even
// though the real content sat inert in the stream. The client reveals normally.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/44-reveal-empty-composite-deadlock.md
import { renderToStream } from "@solidjs/web";
import { createMemo, Loading, Reveal } from "solid-js";

const fetchIn = (value, ms) => new Promise(resolve => setTimeout(() => resolve(value), ms));

function Article() {
  const article = createMemo(async () => fetchIn("Article body", 30));
  return <p>{article()}</p>;
}

// Shared section component: coordinates async children when it has any.
// On this page its children are entirely static.
function PageSection(props) {
  return <Reveal order="natural">{props.children}</Reveal>;
}

function App(props) {
  return (
    <Reveal order="together">
      <Loading fallback={<b>loading article…</b>}>
        <Article />
      </Loading>
      {props.section === "none" && <footer>Static footer</footer>}
      {props.section === "static" && (
        <PageSection>
          <footer>Static footer</footer>
        </PageSection>
      )}
      {props.section === "sync-loading" && (
        <Reveal order="natural">
          <Loading fallback={<i>loading footer…</i>}>
            <footer>Static footer</footer>
          </Loading>
        </Reveal>
      )}
    </Reveal>
  );
}

function streamPage(section) {
  const started = Date.now();
  return new Promise(resolve => {
    const chunks = [];
    renderToStream(() => <App section={section} />).pipe({
      write(chunk) {
        chunks.push({ chunk, at: Date.now() - started });
      },
      end() {
        resolve(chunks);
      }
    });
  });
}

function inspect(chunks) {
  const full = chunks.map(c => c.chunk).join("");
  const groups = [...full.matchAll(/\$dfj\((\[[^\]]*\])\)/g)].map(m => JSON.parse(m[1]));
  const singles = [...full.matchAll(/\$df\("([^"]+)"\)/g)].map(m => m[1]);
  const templateEntry = chunks.find(c => c.chunk.includes("Article body"));
  const articleKey = templateEntry?.chunk.match(/<template id="((?!pl-)[^"]+)"/)?.[1];
  const activated =
    !!articleKey &&
    (groups.some(keys => keys.includes(articleKey)) || singles.includes(articleKey));
  return { ok: activated, groups, singles, articleKey, templateAt: templateEntry?.at };
}

async function run(label, section) {
  const result = inspect(await streamPage(section));
  console.log(`\n${label}: ${result.ok ? "PASS" : "FAIL"}`);
  console.log(`  article template "${result.articleKey}" streamed @ ~${result.templateAt}ms`);
  console.log(
    `  activations: groups=${JSON.stringify(result.groups)} singles=${JSON.stringify(result.singles)}`
  );
  return result.ok;
}

console.log("=== empty/all-sync nested Reveal deadlocks outer together group (server-only) ===");

// CONTROL activates at ~30ms; REPRO A/B must NEVER activate on beta.17.
const control = await run("CONTROL — static footer, no nested Reveal", "none");
const reproA = await run('REPRO A — footer wrapped in <Reveal order="natural">', "static");
const reproB = await run("REPRO B — nested Reveal with a sync-resolving <Loading>", "sync-loading");

// Client comparison (browser build): the REPRO A tree reveals normally —
//   @0ms:  "loading article…Static footer"
//   @50ms: "Article bodyStatic footer"
console.log(
  control && reproA && reproB
    ? "\nPASS — bug is fixed"
    : "\nFAIL — bug reproduced: empty/all-sync nested Reveal deadlocked the outer together group (no $dfj ever emitted)"
);
