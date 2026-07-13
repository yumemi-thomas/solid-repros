import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createSignal, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms))

function Home() {
  const [progress] = createSignal(42)
  const report = createMemo(async () => later('Download ready', 1200))

  return (
    <main style="font-family: system-ui; padding: 2rem">
      <h1>Export report</h1>
      <p data-report-status>
        <Loading fallback={<>Preparing file — {progress()}% complete</>}>
          <strong>{report()}</strong>
        </Loading>
      </p>
    </main>
  )
}

export const Route = createFileRoute('/')({ component: Home })
