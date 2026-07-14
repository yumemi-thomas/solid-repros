import { hydrate } from "@solidjs/web";

const container = document.getElementById("app")!;
container.innerHTML = "<div _hk=0><button>A</button><button>B</button></div>";
globalThis._$HY = { events: [], completed: new WeakSet(), r: {} };

const dispose = hydrate(
  () => (
    <div>
      <button>A</button>
      <button>B</button>
    </div>
  ),
  container
);

console.log(
  "hydrated content present:",
  container.textContent === "AB"
    ? "PASS"
    : `FAIL — expected "AB", got ${JSON.stringify(container.textContent)}`
);

dispose();

console.log(
  "SSR DOM retained after dispose:",
  container.textContent === "AB"
    ? "PASS"
    : `FAIL — expected "AB", got ${JSON.stringify(container.textContent)}`
);
