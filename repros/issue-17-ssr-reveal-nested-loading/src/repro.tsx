// Server-only reproduction (TypeScript) — run with: npx vite-node src/repro.tsx
// Streaming SSR: a <Loading> boundary NESTED inside another <Loading> registers
// into the ancestor <Reveal order="together"> group as if it were a direct
// slot. The group then holds the already-ready outer content hostage until the
// slow nested boundary resolves. Only DIRECT slots should participate (the
// client clears the reveal context for children). — Solid 2.0.0-beta.16
// Issue draft: issue-drafts/17-reveal-nested-loading-grouping.md
import { renderToStream } from "@solidjs/web";
import { createMemo, Loading, Reveal } from "solid-js";

const asyncValue = <T,>(value: T, ms: number): Promise<T> =>
  new Promise(r => setTimeout(() => r(value), ms));

function Inner() {
  const slow = createMemo(async () => asyncValue("inner-slow", 80));
  return <span>{slow()}</span>;
}

function Outer() {
  const fast = createMemo(async () => asyncValue("outer-fast", 10));
  return (
    <div>
      {fast()}
      <Loading fallback={<i>inner loading</i>}>
        <Inner />
      </Loading>
    </div>
  );
}

function App() {
  return (
    <Reveal order="together">
      <Loading fallback={<b>outer loading</b>}>
        <Outer />
      </Loading>
    </Reveal>
  );
}

const chunks: string[] = await new Promise(resolve => {
  const acc: string[] = [];
  renderToStream(() => <App />).pipe({
    write(chunk: string) {
      acc.push(chunk);
    },
    end() {
      resolve(acc);
    }
  });
});

const full = chunks.join("");

// The <Reveal> group has exactly ONE direct slot (the outer <Loading>). Each
// grouped activation ($dfj([...])) must therefore list exactly one key. If the
// nested inner boundary was (incorrectly) enrolled, $dfj carries two keys and
// the ready outer content stays hidden behind its fallback until the slow inner
// data arrives.
const groupCalls = [...full.matchAll(/\$dfj\((\[[^\]]*\])\)/g)].map(m => JSON.parse(m[1]));
const badGroup = groupCalls.find(keys => keys.length !== 1);

// Temporal check: the outer activation should stream BEFORE the slow inner
// template — not be gated behind it.
const activationIdx = chunks.findIndex(c => c.includes("$dfj"));
const innerTemplateIdx = chunks.findIndex(
  c => /<template id="(?!pl-)[^"]*"/.test(c) && c.includes("inner-slow")
);
const outerGatedByInner =
  activationIdx > -1 && innerTemplateIdx > -1 && activationIdx > innerTemplateIdx;

const ok = groupCalls.length > 0 && badGroup === undefined && !outerGatedByInner;

console.log("=== nested Loading enrolled in Reveal group (server-only) ===");
console.log(ok ? "PASS — bug fixed" : "FAIL — bug reproduced");
console.log(
  "expected: every $dfj group lists exactly 1 key (the direct slot); outer activation streams before the slow inner template"
);
console.log(
  `actual:   $dfj groups = ${JSON.stringify(groupCalls)}${
    badGroup ? ` — NESTED boundary enrolled: ${JSON.stringify(badGroup)}` : ""
  }`
);
console.log(
  `          outer activation chunk #${activationIdx}, slow inner template chunk #${innerTemplateIdx}${
    outerGatedByInner ? " — outer activation GATED behind inner template" : ""
  }`
);
