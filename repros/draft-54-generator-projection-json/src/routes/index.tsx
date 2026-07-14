import { createFileRoute } from '@tanstack/solid-router'
import { createProjection, Loading } from 'solid-js'

function Home() {
  const stats = createProjection(async function* () { yield { lastUpdated: new Date('2026-07-12T00:00:00Z'), visitors: new Map([['home', 42]]) } }, { lastUpdated: new Date(0), visitors: new Map<string, number>() })
  const ok = () => stats.lastUpdated instanceof Date && stats.visitors instanceof Map && stats.visitors.get('home') === 42
  return <main><h1>Traffic report</h1><p>Generator projections should keep rich values during SSR.</p><Loading fallback={<p>Loading report…</p>}><p>Updated: {stats.lastUpdated.toLocaleDateString('en-US')}</p><p>Visitors: {stats.visitors.get('home')}</p><p data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS' : 'FAIL'} — Date/Map values {ok() ? 'were preserved' : 'went through JSON serialization'}.</p></Loading></main>
}
export const Route = createFileRoute('/')({ component: Home })
