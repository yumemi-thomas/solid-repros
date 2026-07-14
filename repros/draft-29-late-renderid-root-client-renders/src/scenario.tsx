import { hydrate } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

// Two independently streamed counter islands whose output matches the
// serialized markup below (static "a:" / "b:" text plus a dynamic
// marker-pair slot for the count).
const IslandA = () => {
  const [count, setCount] = createSignal(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>a:{count()}</button>
    </div>
  );
};
const IslandB = () => {
  const [count, setCount] = createSignal(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>b:{count()}</button>
    </div>
  );
};

const islandA = document.getElementById("island-a")!;
const islandB = document.getElementById("island-b")!;

globalThis._$HY = { events: [], completed: new WeakSet(), r: {} };

// Server output of renderToString with renderId "ia" / "ib":
islandA.innerHTML = '<div _hk=ia0><button>a:<!--$-->0<!--/--></button></div>';
islandB.innerHTML = '<div _hk=ib0><button>b:<!--$-->0<!--/--></button></div>';

const serverButtonB = islandB.querySelector("button");

hydrate(IslandA, islandA, { renderId: "ia" });
// island B hydrates later (e.g. on visibility / after its chunk loads)
await new Promise(resolve => setTimeout(resolve, 30));
hydrate(IslandB, islandB, { renderId: "ib" });
flush();

console.log(
  "island B keeps server node identity:",
  islandB.querySelector("button") === serverButtonB
    ? "PASS"
    : "FAIL — the button was recreated by a client render"
);
