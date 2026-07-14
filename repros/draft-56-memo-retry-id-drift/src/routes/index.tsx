import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createUniqueId, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function Profile() {
  const user = createMemo(async () => later('Alice', 50))
  let firstId: string | undefined
  const card = createMemo(() => { const id = createUniqueId(); firstId ??= id; return { name: user(), firstId, finalId: id } })
  const ok = () => card().firstId === card().finalId
  return <p data-result={ok() ? 'pass' : 'fail'}>{card().name}: first id {card().firstId}, final id {card().finalId} — {ok() ? 'PASS' : 'FAIL'}</p>
}
function Home() { return <main><h1>Account profile</h1><p>An async retry must reuse the hydration-id slot allocated by its first attempt.</p><Loading fallback={<p>Loading profile…</p>}><Profile /></Loading></main> }
export const Route = createFileRoute('/')({ component: Home })
