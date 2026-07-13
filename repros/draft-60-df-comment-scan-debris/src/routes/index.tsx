import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createSignal, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms))

function ExportStatus() {
  const [progress] = createSignal(42)
  const report = createMemo(async () => later('Download ready', 1200))

  return (
    <p class="status" data-report-status aria-live="polite">
      <Loading fallback={<>Preparing file — {progress()}% complete</>}>
        <strong>{report()}</strong>
      </Loading>
    </p>
  )
}

function Home() {
  return (
    <main>
      <section class="intro">
        <p class="framework">TanStack Start × Solid 2.0</p>
        <h1>Real streamed route reproduction</h1>
        <p>
          The route renders its progress fallback immediately. After 1.2 seconds,
          TanStack Start streams the resolved fragment and Solid's generated
          activation script swaps it into the live page. The custom client entry
          waits 1.8 seconds to simulate deferred JavaScript and hydrate afterward.
        </p>
      </section>

      <article class="card">
        <p class="eyebrow">Quarterly revenue</p>
        <h2>Export report</h2>
        <ExportStatus />
      </article>

      <section id="verdict" class="verdict waiting">
        Observing the streamed DOM mutation…
      </section>
    </main>
  )
}

export const Route = createFileRoute('/')({ component: Home })
