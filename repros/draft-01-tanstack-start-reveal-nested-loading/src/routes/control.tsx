import { createFileRoute, Link } from '@tanstack/solid-router'
import { createMemo, Loading, Reveal } from 'solid-js'

const later = <T,>(value: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(value), ms))

function ProductDetails() {
  const product = createMemo(async () => later('Trail Pack 40L — $149', 300))
  return (
    <section>
      <h1>{product()}</h1>
    </section>
  )
}

function Reviews() {
  const reviews = createMemo(async () => later('★★★★★ 4.8 — 1,204 reviews', 800))
  return <aside>{reviews()}</aside>
}

function Control() {
  return (
    <main>
      <h2>Control — same page, no nested boundary</h2>
      <Reveal order="together">
        <Loading fallback={<p style="color:gray">loading product…</p>}>
          <ProductDetails />
        </Loading>
        <Loading fallback={<p style="color:gray">loading reviews…</p>}>
          <Reviews />
        </Loading>
      </Reveal>
      <Link to="/">Repro page (nested boundary)</Link>
    </main>
  )
}

export const Route = createFileRoute('/control')({ component: Control })
