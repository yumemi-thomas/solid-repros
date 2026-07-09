// Generate self-contained StackBlitz launcher pages (one per repro) that POST
// the repro's files inline to https://stackblitz.com/run — bypassing the flaky
// GitHub subfolder importer entirely. Output lands in docs/ (GitHub Pages root).
//
// Usage: node tools/build-launchers.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const REPROS = join(ROOT, "repros");
const OUT = join(ROOT, "docs");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);
const SKIP_FILES = new Set(["package-lock.json", ".DS_Store"]);

const esc = s =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function walk(dir, base = dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, base, acc);
    } else if (!SKIP_FILES.has(name)) {
      acc.push({ path: relative(base, full), content: readFileSync(full, "utf8") });
    }
  }
  return acc;
}

function launcherHtml(slug, files, openFile) {
  const inputs = files
    .map(f => `      <input type="hidden" name="project[files][${esc(f.path)}]" value="${esc(f.content)}" />`)
    .join("\n");
  const action = `https://stackblitz.com/run?file=${encodeURIComponent(openFile)}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Open ${esc(slug)} in StackBlitz</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 3rem auto; max-width: 40rem; padding: 0 1rem; color: #ddd; background: #0e1116; }
    a, button { color: #7cc; }
    button { font: inherit; padding: .6rem 1rem; border: 1px solid #7cc; background: transparent; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>${esc(slug)}</h1>
  <p>Opening this reproduction in StackBlitz&hellip; if it doesn't start automatically, click the button.</p>
  <form id="sb" method="post" action="${action}" target="_self">
    <input type="hidden" name="project[title]" value="${esc(slug)}" />
    <input type="hidden" name="project[description]" value="Solid 2.0 repro — ${esc(slug)}" />
    <input type="hidden" name="project[template]" value="node" />
${inputs}
    <button type="submit">Open in StackBlitz</button>
  </form>
  <script>document.getElementById("sb").submit();</script>
</body>
</html>
`;
}

mkdirSync(OUT, { recursive: true });
const slugs = readdirSync(REPROS).filter(d => statSync(join(REPROS, d)).isDirectory());
const index = [];
for (const slug of slugs) {
  const dir = join(REPROS, slug);
  const files = walk(dir);
  const paths = new Set(files.map(f => f.path));
  const openFile = paths.has("src/repro.jsx")
    ? "src/repro.jsx"
    : paths.has("src/App.jsx")
    ? "src/App.jsx"
    : "package.json";
  writeFileSync(join(OUT, `${slug}.html`), launcherHtml(slug, files, openFile));
  index.push({ slug, kind: openFile === "src/repro.jsx" ? "SSR (terminal)" : "client (preview)" });
  console.log(`wrote docs/${slug}.html (${files.length} files, open=${openFile})`);
}

// Simple index page listing every launcher.
const list = index
  .map(({ slug, kind }) => `  <li><a href="./${slug}.html">${slug}</a> — <em>${kind}</em></li>`)
  .join("\n");
writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>solid-repros — StackBlitz launchers</title>
<style>body{font-family:system-ui,sans-serif;margin:3rem auto;max-width:44rem;padding:0 1rem;color:#ddd;background:#0e1116}a{color:#7cc}</style></head>
<body><h1>solid-repros</h1><p>Each link POSTs the repro's files straight into StackBlitz (no GitHub import).</p>
<ul>\n${list}\n</ul></body></html>\n`,
);
console.log(`\nwrote docs/index.html (${index.length} launchers)`);
