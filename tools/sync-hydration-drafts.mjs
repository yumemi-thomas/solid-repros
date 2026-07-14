// Synchronize low-level hydration issue examples into visible browser repros.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DRAFTS = resolve(ROOT, "../solid/issue-drafts");
const stems = [
  "26-hydration-nullish-serialized-value",
  "27-hydration-hybrid-sync-store-write-dropped",
  "28-hydration-preload-dispose-resurrects",
  "29-late-renderid-root-client-renders",
  "30-stale-event-blocks-replay-queue",
  "31-hydrate-disposer-deletes-ssr-dom",
  "32-injected-comment-breaks-text-hydration"
];

const packageJson = slug =>
  JSON.stringify(
    {
      name: slug,
      private: true,
      type: "module",
      scripts: { dev: "vite dev", start: "vite dev", build: "vite build" },
      dependencies: { "@solidjs/web": "2.0.0-beta.17", "solid-js": "2.0.0-beta.17" },
      devDependencies: { vite: "^7.0.0", "vite-plugin-solid": "3.0.0-next.7", typescript: "^5.8.3" }
    },
    null,
    2
  );
const vite = `import { defineConfig } from 'vite'\nimport solid from 'vite-plugin-solid'\nexport default defineConfig({ plugins: [solid()] })\n`;
const tsconfig = JSON.stringify(
  {
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "preserve",
      jsxImportSource: "@solidjs/web",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      isolatedModules: true,
      types: ["vite/client"],
      lib: ["DOM", "DOM.Iterable", "ESNext"]
    },
    include: ["src/**/*.ts", "src/**/*.tsx"]
  },
  null,
  2
);

function section(markdown) {
  const a = markdown.indexOf("### Your Example Website or App");
  const b = markdown.indexOf("### Steps to Reproduce", a);
  return markdown.slice(a, b);
}
function blocks(markdown) {
  return [...section(markdown).matchAll(/```tsx\n([\s\S]*?)```/g)].map(match => match[1].trim());
}
function write(path, contents) {
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, contents.endsWith("\n") ? contents : contents + "\n");
}

for (const stem of stems) {
  const draft = join(DRAFTS, stem + ".md");
  let markdown = readFileSync(draft, "utf8");
  const code = stem.startsWith("32-")
    ? blocks(markdown).slice(0, 2).join("\n\n")
    : blocks(markdown).at(-1);
  const slug = `draft-${stem}`;
  const dir = join(ROOT, "repros", slug);
  const mounts = stem.startsWith("29-")
    ? '<div id="island-a"></div><div id="island-b"></div>'
    : '<div id="app"></div>';
  write(join(dir, "package.json"), packageJson(slug));
  write(join(dir, "vite.config.ts"), vite);
  write(join(dir, "tsconfig.json"), tsconfig);
  write(
    join(dir, "index.html"),
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${stem}</title></head><body><main><h1>${stem}</h1><p>The result below is produced by the real browser hydration runtime.</p><pre id="output">Running…</pre>${mounts}</main><script type="module" src="/src/index.tsx"></script></body></html>`
  );
  write(
    join(dir, "src/index.tsx"),
    `const output = document.getElementById('output')!\noutput.textContent = ''\nconst original = console.log\nconsole.log = (...values: unknown[]) => { original(...values); output.textContent += values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ') + '\\n' }\nawait import('./scenario')\n`
  );
  write(join(dir, "src/scenario.tsx"), code);
  write(
    join(dir, "README.md"),
    `# ${slug}\n\nBrowser reproduction for \`issue-drafts/${stem}.md\`. It uses the real Solid hydration runtime and prints every expected/actual check on the page as well as in the console.\n`
  );
  const live = `**[Live reproduction](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=${slug})** — opens the browser hydration repro in StackBlitz.`;
  markdown = markdown.replace(/^_StackBlitz link to be added[^\n]*_$/m, live);
  writeFileSync(draft, markdown);
  console.log(slug);
}
