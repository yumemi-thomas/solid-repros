import { hydrate } from "@solidjs/web";

const container = document.getElementById("app")!;

// Gate the island's entry module behind a promise we control — this is the
// slow network fetch of the lazy-hydration chunk.
let release!: () => void;
(globalThis as any).__moduleGate = new Promise<void>(resolve => (release = resolve));
const entry = "data:text/javascript,await globalThis.__moduleGate; export default 1";

// Server-rendered markup plus the root asset map that defers the mount.
container.innerHTML = "<div _hk=0><button>Subscribe</button></div>";
(globalThis as any)._$HY = {
  events: [],
  completed: new WeakSet(),
  r: { _assets: { app: entry } }
};

const clicks: string[] = [];
const dispose = hydrate(
  () => (
    <div>
      <button onClick={() => clicks.push("subscribe")}>Subscribe</button>
    </div>
  ),
  container
);

dispose(); // the app unmounts the island while the module is still loading
release(); // ...then the chunk finishes downloading
await new Promise(resolve => setTimeout(resolve, 20));

container.querySelector("button")!.click();
console.log(
  "disposed root stays inert:",
  clicks.length === 0 ? "PASS" : `FAIL — expected [], got ${JSON.stringify(clicks)}`
);
