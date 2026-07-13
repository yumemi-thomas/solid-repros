import { createMemo, createSignal, Loading } from "solid-js";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [progress] = createSignal(42);
  const report = createMemo(async () => {
    await sleep(1200);
    return "Download ready";
  });

  return (
    <article class="card">
      <p class="eyebrow">Quarterly revenue</p>
      <h1>Export report</h1>
      <p class="status" data-report-status aria-live="polite">
        <Loading fallback={<>Preparing file — {progress()}% complete</>}>
          <strong>{report()}</strong>
        </Loading>
      </p>
    </article>
  );
}
