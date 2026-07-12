// Server-only reproduction — run in the StackBlitz terminal (npm run repro).
// SSR/client asymmetry: deep() is documented to return a plain (non-proxy) DEEP
// COPY of a store. On the SERVER it is the identity function — it returns the
// live store itself. So deep(s) === s is true on the server (false on client),
// and normalizing the "copy" silently mutates the store's rendered state.
// Client: deep() returns a detached copy → the same code leaves the store intact.
// — Solid 2.0.0-beta.17
// Issue draft: issue-drafts/55-deep-returns-live-store.md
import { createStore, deep } from "solid-js";

const [profile, setProfile] = createStore({
  user: { name: "Ada", email: "ada@example.com" },
});
setProfile((s) => {
  s.user.name = "Grace";
});

// Documented contract: a plain (non-proxy) DEEP COPY of the store.
const payload = deep(profile);

// 1. Identity check — false on client, true on server.
const identity = payload === profile;
console.log(`deep(store) === store: ${identity}`);

// 2. Normalize the copy before handing it to non-reactive code…
payload.user.name = payload.user.name.toUpperCase();

// …the store itself must not change. On the server it does (the "copy" IS the store).
console.log(`store after normalizing the copy: ${JSON.stringify(profile.user)}`);

const ok = !identity && profile.user.name === "Grace";
console.log(
  "\n=== deep() returns a detached copy? (server) ===",
);
console.log(
  ok
    ? "PASS — bug is fixed (server returns a detached deep copy)"
    : "FAIL — bug reproduced: deep() returned the live store; normalizing the copy mutated rendered state",
);
