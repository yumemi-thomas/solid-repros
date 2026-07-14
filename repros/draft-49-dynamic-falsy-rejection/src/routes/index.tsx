import { createFileRoute } from '@tanstack/solid-router'
import { dynamic } from '@solidjs/web'
import { Errored, Loading } from 'solid-js'

const MissingPanel = dynamic(() => Promise.reject(undefined))
function Home() {
  return <main><h1>Account</h1><p>Expected: a failed lazy panel reaches the error fallback.</p><Errored fallback={<p data-panel-error>Panel unavailable</p>}><Loading fallback={<p>Loading panel…</p>}><MissingPanel /></Loading></Errored></main>
}
export const Route = createFileRoute('/')({ component: Home })
