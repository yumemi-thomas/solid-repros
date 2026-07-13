import { hydrate } from "@solidjs/web";
import { flush } from "solid-js";
import App from "./App.jsx";

const root = document.getElementById("app");
const verdict = document.getElementById("verdict");
const expected = "Download ready";
const afterStream = window.__afterStream;

hydrate(() => <App />, root);
flush();
await new Promise(resolve => setTimeout(resolve, 50));
flush();

const afterHydration = document.querySelector("[data-report-status]").textContent;
const reproduced = afterStream !== expected && afterHydration !== expected;

verdict.className = reproduced ? "verdict fail" : "verdict pass";
verdict.innerHTML = `
  <strong>${reproduced ? "FAIL — bug reproduced" : "PASS — no fallback debris"}</strong>
  <span>Expected: ${JSON.stringify(expected)}</span>
  <span>After real stream: ${JSON.stringify(afterStream)}</span>
  <span>After hydration: ${JSON.stringify(afterHydration)}</span>
`;

console.log({ expected, afterStream, afterHydration });
