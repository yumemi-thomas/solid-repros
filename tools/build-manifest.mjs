// Generate docs/repros.json — a manifest mapping each repro slug to its file
// CONTENTS (path → text), plus title + the file to open. The dynamic launcher
// (docs/launch.html) fetches ONLY this one file (same-origin, from the GitHub
// Pages CDN — no raw.githubusercontent rate limits) and POSTs the embedded files
// into StackBlitz. Re-run after ANY repro edit (contents are snapshotted here).
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
  const paths = walk(dir).sort();
  const openFile = paths.includes("src/repro.jsx")
    ? "src/repro.jsx"
    : paths.includes("src/App.jsx")
    ? "src/App.jsx"
    : "package.json";
  const files = {};
  for (const p of paths) files[p] = readFileSync(join(dir, p), "utf8");
  repros[slug] = { title: slug, openFile, kind: openFile === "src/repro.jsx" ? "ssr" : "client", files };
}

writeFileSync(join(OUT, "repros.json"), JSON.stringify({ owner: "yumemi-thomas", repo: "solid-repros", branch: "main", repros }) + "\n");
console.log(`wrote docs/repros.json (${Object.keys(repros).length} repros)`);
for (const [slug, r] of Object.entries(repros)) console.log(`  ${slug}: ${Object.keys(r.files).length} files, open=${r.openFile}`);
