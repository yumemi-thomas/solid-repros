const output = document.getElementById("output")!;
output.textContent = "";
const original = console.log;
console.log = (...values: unknown[]) => {
  original(...values);
  output.textContent +=
    values.map(value => (typeof value === "string" ? value : JSON.stringify(value))).join(" ") +
    "\n";
};
await import("./scenario");
