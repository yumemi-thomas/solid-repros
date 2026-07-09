// Generate docs/repros.json — a manifest mapping each repro slug to its file
// PATHS (not contents), plus title + the file to open. The dynamic launcher
// (docs/launch.html) reads this, fetches the file contents live from GitHub raw
// at click time, and POSTs them into StackBlitz. So repros/ stays the single
// source of truth: content edits need NO regeneration — only re-run this when
// files are ADDED or REMOVED from a repro.
//
// Usage: node tools/build-manifest.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const REPROS = join(ROOT, "repros");
const OUT = join(ROOT, "docs");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);
const SKIP_FILES = new Set(["package-lock.json", ".DS_Store"]);

function walk(dir, base = dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, base, acc);
    } else if (!SKIP_FILES.has(name)) {
      acc.push(relative(base, full));
    }
  }
  return acc;
}

mkdirSync(OUT, { recursive: true });
const repros = {};
for (const slug of readdirSync(REPROS)) {
  const dir = join(REPROS, slug);
  if (!statSync(dir).isDirectory()) continue;
  const files = walk(dir).sort();
  const openFile = files.includes("src/repro.jsx")
    ? "src/repro.jsx"
    : files.includes("src/App.jsx")
    ? "src/App.jsx"
    : "package.json";
  repros[slug] = { title: slug, openFile, kind: openFile === "src/repro.jsx" ? "ssr" : "client", files };
}

writeFileSync(join(OUT, "repros.json"), JSON.stringify({ owner: "yumemi-thomas", repo: "solid-repros", branch: "main", repros }, null, 2) + "\n");
console.log(`wrote docs/repros.json (${Object.keys(repros).length} repros)`);
for (const [slug, r] of Object.entries(repros)) console.log(`  ${slug}: ${r.files.length} files, open=${r.openFile}`);
