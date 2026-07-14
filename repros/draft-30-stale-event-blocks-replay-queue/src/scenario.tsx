import { hydrate } from "@solidjs/web";

const container = document.getElementById("app")!;
container.innerHTML = "<div _hk=0><button>A</button><button>B</button></div>";
globalThis._$HY = { events: [], completed: new WeakSet(), r: {} };

// 1) pre-hydration click on a streamed fallback button that the server
//    fragment already replaced — its node is detached now
const removed = document.createElement("button");
// 2) pre-hydration click on button B, which is still in the DOM
const buttonB = container.querySelectorAll("button")[1];

globalThis._$HY.events.push([removed, new MouseEvent("click", { bubbles: true })]);
globalThis._$HY.events.push([buttonB, new MouseEvent("click", { bubbles: true })]);

const clicks: string[] = [];
hydrate(
  () => (
    <div>
      <button onClick={() => clicks.push("A")}>A</button>
      <button onClick={() => clicks.push("B")}>B</button>
    </div>
  ),
  container
);

await new Promise(resolve => setTimeout(resolve, 30));
console.log(
  "queued live event replayed:",
  JSON.stringify(clicks) === JSON.stringify(["B"])
    ? "PASS"
    : `FAIL — expected ["B"], got ${JSON.stringify(clicks)}`
);
