import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, Loading, Reveal } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function LastSyncedChip() { const value = createMemo(async () => later('just now', 1200)); return <small>last synced: <Loading fallback={<span>…</span>}>{value()}</Loading></small> }
function Statement() { const value = createMemo(async () => later('$1,284.50 due July 28', 200)); return <p>{value()}</p> }
function Account() { const value = createMemo(async () => later('Premium · Autopay on', 100)); return <aside>{value()}</aside> }
function Home() { return <main><h1>Billing overview</h1><p>The statement and account should reveal together at ~200ms. The chip inside a discarded fallback must not hold them to ~1.2s.</p><Reveal order="together"><Loading fallback={<p>Loading statement… <LastSyncedChip /></p>}><Statement /></Loading><Loading fallback={<p>Loading account…</p>}><Account /></Loading></Reveal></main> }
export const Route = createFileRoute('/')({ component: Home })
