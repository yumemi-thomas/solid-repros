import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createSignal, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms))

function Home() {
  const [progress] = createSignal(42)
  const report = createMemo(async () => later('Download ready', 1200))

  return (
    <main style="max-width: 48rem; margin: 4rem auto; padding: 0 1.5rem; font-family: system-ui; color: #18181b">
      <p style="margin: 0 0 0.75rem; color: #52525b; font-size: 0.875rem">
        TanStack Start · Solid 2 streaming SSR
      </p>
      <h1 style="margin: 0; font-size: 2rem">Streamed fallback debris</h1>
      <p style="margin: 0.75rem 0 2rem; color: #52525b">
        After 1.2 seconds, the actual value should exactly match the expected value.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem">
        <section style="padding: 1.25rem; border: 1px solid #86efac; border-radius: 0.75rem; background: #f0fdf4">
          <small style="color: #166534; font-weight: 700">EXPECTED</small>
          <p style="margin: 0.75rem 0 0; font-size: 1.125rem">
            <strong>Download ready</strong>
          </p>
        </section>

        <section style="padding: 1.25rem; border: 1px solid #fca5a5; border-radius: 0.75rem; background: #fef2f2">
          <small style="color: #991b1b; font-weight: 700">ACTUAL DOM</small>
          <p data-report-status aria-live="polite" style="margin: 0.75rem 0 0; font-size: 1.125rem">
            <Loading fallback={<>Preparing file — {progress()}% complete</>}>
              <strong>{report()}</strong>
            </Loading>
          </p>
        </section>
      </div>

      <p style="margin: 1rem 0 0; padding: 0.875rem 1rem; border-left: 4px solid #dc2626; background: #fafafa">
        <strong>Bug:</strong> <code>42% complete</code> is stale fallback text left behind by <code>$df</code>.
      </p>

      <p style="margin-top: 1.5rem; color: #71717a; font-size: 0.875rem">
        Client hydration is intentionally omitted so the real server-stream mutation remains visible.
      </p>
    </main>
  )
}

export const Route = createFileRoute('/')({ component: Home })
