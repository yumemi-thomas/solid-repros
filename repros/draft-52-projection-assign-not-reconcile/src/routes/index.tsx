import { createFileRoute } from '@tanstack/solid-router'
import { createProjection } from 'solid-js'

function Home() {
  const seed = [{ id: 1, name: 'Trail Pack' }, { id: 2, name: 'Camp Stove' }, { id: 3, name: 'Head Lamp' }]
  const visible = createProjection(() => seed.slice(0, 2), seed)
  const ok = visible.length === 2
  return <main><h1>Visible products</h1><p>Expected: two rows after filtering.</p><ul>{visible.map(product => <li>{product.name}</li>)}</ul><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — rendered {visible.length} rows.</p></main>
}
export const Route = createFileRoute('/')({ component: Home })
