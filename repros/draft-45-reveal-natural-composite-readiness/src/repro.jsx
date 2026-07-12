// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// Streaming SSR/client asymmetry for nested reveal groups. A `natural` group
// counts a nested COMPOSITE child as ready only when it is FULLY resolved on the
// server, but on MINIMAL readiness on the client. So an outer `together` that
// wraps a `natural` middle group is held until the slowest grandchild resolves
// on the server, while the client releases it as soon as each direct slot is
// minimally ready. Same tree, different reveal timing depending on arrival.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/45-reveal-natural-composite-readiness.md
import { renderToStream } from "@solidjs/web";
import { createMemo, Loading, Reveal } from "solid-js";

const fetchIn = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function Profile() {
  const profile = createMemo(async () => fetchIn("Profile", 30));
  return <h1>{profile()}</h1>;
}
function FastCard() {
  const card = createMemo(async () => fetchIn("Fast card", 20));
  return <p>{card()}</p>;
}
function SlowCard() {
  const card = createMemo(async () => fetchIn("Slow card", 120));
  return <p>{card()}</p>;
}

// together > natural > (natural composite: fast + slow slot)
function App() {
  return (
    <Reveal order="together">
      <Loading fallback={<b>loading profile…</b>}>
        <Profile />
      </Loading>
      <Reveal order="natural">
        <Reveal order="natural">
          <Loading fallback={<i>loading fast card…</i>}>
            <FastCard />
          </Loading>
          <Loading fallback={<i>loading slow card…</i>}>
            <SlowCard />
          </Loading>
        </Reveal>
      </Reveal>
    </Reveal>
  );
}

const started = Date.now();
const chunks = [];
await new Promise((resolve) => {
  renderToStream(() => <App />).pipe({
    write(chunk) {
      chunks.push({ chunk, at: Date.now() - started });
    },
    end() {
      resolve();
    },
  });
});

const findAt = (needle) =>
  chunks.find((c) =>
    typeof needle === "string" ? c.chunk.includes(needle) : needle.test(c.chunk),
  )?.at;

const profileTemplateAt = findAt("Profile</h1>");
const fastTemplateAt = findAt("Fast card");
const slowTemplateAt = findAt("Slow card");
const activationAt = findAt(/\$dfj\(/);
const groups = [
  ...chunks.map((c) => c.chunk).join("").matchAll(/\$dfj\((\[[^\]]*\])\)/g),
].map((m) => JSON.parse(m[1]));

console.log(`profile template   @ ~${profileTemplateAt}ms`);
console.log(`fast card template @ ~${fastTemplateAt}ms`);
console.log(`slow card template @ ~${slowTemplateAt}ms`);
console.log(`first $dfj         @ ~${activationAt}ms; groups: ${JSON.stringify(groups)}`);

// Client comparison (browser build of the same tree), for reference:
//   @0ms:   "loading profile…loading fast card…loading slow card…"
//   @50ms:  "ProfileFast cardloading slow card…"   ← outer released at ~30ms
//   @150ms: "ProfileFast cardSlow card"
// The server never exposes the ~30ms intermediate state above: it holds every
// direct slot on its skeleton until the slow grandchild resolves at ~120ms.

console.log(
  "\n=== natural group holds a nested composite until FULL resolution (server-only) ===",
);
const ok = activationAt != null && slowTemplateAt != null && activationAt < slowTemplateAt;
console.log(
  ok
    ? "PASS — bug is fixed (outer together released at direct-slot minimal readiness)"
    : "FAIL — bug reproduced: outer together held until the slow grandchild fully resolved",
);
