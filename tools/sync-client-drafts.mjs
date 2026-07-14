// Synchronize browser-focused issue-draft examples into standalone Vite apps.
//
// This intentionally handles only drafts whose primary reproduction is a
// client-side component. SSR and hydration repros need purpose-built TanStack
// Start projects and are maintained separately.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DRAFTS = resolve(ROOT, "../solid/issue-drafts");

const clientDrafts = [
  "02-dispose-wipes-preexisting-content",
  "03-store-map-set-date-crash",
  "04-reconcile-keyless-leaf",
  "05-snapshot-drops-symbol-keys",
  "06-accessor-setter-shadowed",
  "07-freeze-store-poison",
  "08-draft-reassign-identity",
  "09-writable-async-memo-race",
  "13-memo-double-recompute-lost-cleanup",
  "14-error-heal-equal-value",
  "15-boundary-dispose-skips-sibling-queue",
  "16-throwing-effect-drops-siblings",
  "17-map-falsy-fallback-leak",
  "18-delegated-bound-handler-stale-data",
  "19-bound-handler-array-mutation",
  "20-property-binding-undefined",
  "21-fragment-stranded-children",
  "22-dev-crash-frozen-component",
  "33-projection-draft-identity",
  "34-empty-string-projection-key",
  "35-projection-defineproperty-noop",
  "37-array-length-validation",
  "38-returned-array-shape",
  "39-reconcile-array-metadata-stale",
  "40-snapshot-array-holes-metadata",
  "41-snapshot-root-cycle"
];

function exampleSection(markdown) {
  const start = markdown.indexOf("### Your Example Website or App");
  const end = markdown.indexOf("### Steps to Reproduce", start);
  if (start < 0 || end < 0) throw new Error("draft is missing its example section");
  return markdown.slice(start, end);
}

function fenced(section, language) {
  return [...section.matchAll(new RegExp("```" + language + "\\n([\\s\\S]*?)```", "g"))].map(
    match => match[1].trimEnd()
  );
}

function write(path, contents) {
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, contents.endsWith("\n") ? contents : contents + "\n");
}

for (const stem of clientDrafts) {
  const draftPath = join(DRAFTS, stem + ".md");
  if (!existsSync(draftPath)) throw new Error(`missing ${draftPath}`);
  let markdown = readFileSync(draftPath, "utf8");
  const slug = `draft-${stem}`;
  const live = `**[Live reproduction](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=${slug})** — opens the standalone browser repro in StackBlitz.`;
  markdown = markdown
    .replace(/^\*\*StackBlitz:\*\* .*$/m, live)
    .replace(/^_StackBlitz link to be added[^\n]*_$/m, live);
  writeFileSync(draftPath, markdown);
  const section = exampleSection(markdown);
  const app = fenced(section, "tsx").at(-1) ?? fenced(section, "jsx").at(-1);
  if (!app) throw new Error(`${basename(draftPath)} has no TSX/JSX example`);

  const dir = join(ROOT, "repros", slug);
  const title = markdown.match(/^# (.+)$/m)?.[1] ?? stem;
  const html = fenced(section, "html")[0];

  write(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name: slug,
        private: true,
        type: "module",
        scripts: { dev: "vite dev", start: "vite dev", build: "vite build" },
        dependencies: { "@solidjs/web": "2.0.0-beta.17", "solid-js": "2.0.0-beta.17" },
        devDependencies: {
          vite: "^7.0.0",
          "vite-plugin-solid": "3.0.0-next.7",
          typescript: "^5.8.3"
        }
      },
      null,
      2
    )
  );
  write(
    join(dir, "vite.config.ts"),
    `import { defineConfig } from 'vite'\nimport solid from 'vite-plugin-solid'\n\nexport default defineConfig({ plugins: [solid()] })\n`
  );
  write(
    join(dir, "tsconfig.json"),
    JSON.stringify(
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
    )
  );
  write(
    join(dir, "index.html"),
    html
      ? `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${stem}</title>\n  </head>\n  <body>\n    ${html.replaceAll("\n", "\n    ")}\n  </body>\n</html>\n`
      : `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${stem}</title>\n  </head>\n  <body><div id="root"></div><script type="module" src="/src/index.tsx"></script></body>\n</html>\n`
  );
  write(
    join(dir, "src/index.tsx"),
    `import { render } from '@solidjs/web'\nimport App from './App'\n\nrender(() => <App />, document.getElementById('root')!)\n`
  );
  write(join(dir, "src/App.tsx"), app);
  write(
    join(dir, "README.md"),
    `# ${slug}\n\n${title}\n\nThis standalone browser reproduction mirrors the reviewed example in\n\`issue-drafts/${stem}.md\`. Open the preview and follow the on-screen action;\nthe result is reported as an explicit PASS/FAIL verdict.\n\nPinned to \`solid-js@2.0.0-beta.17\` and \`@solidjs/web@2.0.0-beta.17\`.\n`
  );
  console.log(slug);
}
