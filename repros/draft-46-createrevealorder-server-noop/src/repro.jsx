// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// `createRevealOrder` (the primitive `<Reveal>` wraps) is a bare passthrough on
// the server: it sets no group context and registers no composite slot. Two
// consequences:
//   (a) its <Loading> children look up RevealGroupContext, find the ANCESTOR
//       <Reveal>'s group, and enroll as DIRECT slots of it (membership leak).
//   (b) its own `order` option coordinates nothing on the server.
// A <Reveal order="natural"> control scopes correctly; the primitive leaks.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/46-createrevealorder-server-noop.md
import { renderToStream } from "@solidjs/web";
import { createMemo, createRevealOrder, Loading, Reveal } from "solid-js";

const fetchIn = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function Hero() {
  const hero = createMemo(async () => fetchIn("Hero", 30));
  return <h1>{hero()}</h1>;
}
function CardA() {
  const a = createMemo(async () => fetchIn("Card A", 60));
  return <p>{a()}</p>;
}
function CardB() {
  const b = createMemo(async () => fetchIn("Card B", 150));
  return <p>{b()}</p>;
}

const cards = () => (
  <>
    <Loading fallback={<i>loading card A…</i>}>
      <CardA />
    </Loading>
    <Loading fallback={<i>loading card B…</i>}>
      <CardB />
    </Loading>
  </>
);

// Design-system component built on the documented primitive.
function CardGrid() {
  return createRevealOrder(cards, { order: () => "natural" });
}

function streamPage(app) {
  const started = Date.now();
  return new Promise((resolve) => {
    const chunks = [];
    renderToStream(app).pipe({
      write(chunk) {
        chunks.push({ chunk, at: Date.now() - started });
      },
      end() {
        resolve(chunks);
      },
    });
  });
}

function report(label, chunks) {
  const full = chunks.map((c) => c.chunk).join("");
  const groups = [...full.matchAll(/\$dfj\((\[[^\]]*\])\)/g)].map((m) => JSON.parse(m[1]));
  const singles = [...full.matchAll(/\$df\("([^"]+)"\)/g)].map((m) => m[1]);
  const activationAt = chunks.find((c) => /\$dfj?\(/.test(c.chunk))?.at;
  console.log(`\n${label}`);
  console.log(`  groups=${JSON.stringify(groups)} singles=${JSON.stringify(singles)}`);
  console.log(`  first activation @ ~${activationAt}ms`);
  return { groups, singles };
}

const repro1 = report(
  "REPRO 1 — createRevealOrder(natural) under Reveal(together)",
  await streamPage(() => (
    <Reveal order="together">
      <Loading fallback={<b>loading hero…</b>}>
        <Hero />
      </Loading>
      <CardGrid />
    </Reveal>
  )),
);

report(
  'CONTROL — <Reveal order="natural"> instead of createRevealOrder',
  await streamPage(() => (
    <Reveal order="together">
      <Loading fallback={<b>loading hero…</b>}>
        <Hero />
      </Loading>
      <Reveal order="natural">{cards()}</Reveal>
    </Reveal>
  )),
);

const repro2 = report(
  "REPRO 2 — standalone createRevealOrder(together)",
  await streamPage(() => createRevealOrder(cards, { order: () => "together" })),
);

// Client comparison (browser build), for reference:
//   REPRO 1 tree behaves like the CONTROL — outer released at ~60ms (hero + card
//   A), card B trails at ~150ms; the custom group is one composite slot, never a
//   set of direct slots of the outer `together`.
//   REPRO 2 coordinates — both cards stay on fallbacks until ~150ms, then appear
//   together (the `together` option is honored on the client).

const leaked = repro1.groups.some((keys) => keys.length === 3);
const uncoordinated = repro2.groups.length === 0;
console.log("\n=== createRevealOrder is a server no-op (membership leak + no coordination) ===");
console.log(
  !leaked && !uncoordinated
    ? "PASS — bug is fixed"
    : `FAIL — bug reproduced: ${leaked ? "cards leaked into the ancestor group" : ""}${
        leaked && uncoordinated ? "; " : ""
      }${uncoordinated ? "standalone createRevealOrder did not coordinate" : ""}`,
);
