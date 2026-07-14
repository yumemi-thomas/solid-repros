import { hydrate } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

const container = document.getElementById("app")!;
globalThis._$HY = { events: [], completed: new WeakSet(), r: {} };

// Server output of <div><p>{text()}</p></div> with text = "hello",
// plus a comment injected by a proxy/extension:
container.innerHTML = "<div _hk=0><p><!--injected-->hello</p></div>";

let setText!: (value: string) => void;
hydrate(() => {
  const [text, set] = createSignal("hello");
  setText = set;
  return (
    <div>
      <p>{text()}</p>
    </div>
  );
}, container);

setText("world");
flush();

const pText = container.querySelector("p")!.textContent;
console.log(
  "sole text child updated:",
  pText === "world" ? "PASS" : `FAIL — expected "world", got ${JSON.stringify(pText)}`
);
