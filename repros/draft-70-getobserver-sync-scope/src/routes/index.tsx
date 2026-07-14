import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, getObserver, untrack } from 'solid-js'

function Home() { const tracked = createMemo(() => getObserver() !== null); const cleared = createMemo(() => untrack(() => getObserver()) === null); const sync = createMemo(() => getObserver() !== null, { sync: true }); const ok = tracked() && cleared() && sync(); return <main><h1>Tracked subscription adapter</h1><p>Tracked memo: {String(tracked())}</p><p>Cleared in untrack: {String(cleared())}</p><p>Compiler-style sync memo: {String(sync())}</p><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — observer scope differs during SSR.</p></main> }
export const Route = createFileRoute('/')({ component: Home })
