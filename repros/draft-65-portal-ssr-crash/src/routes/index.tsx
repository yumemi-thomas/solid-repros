import { createFileRoute } from '@tanstack/solid-router'
import { Portal } from '@solidjs/web'

function Home() { return <main><h1>Dashboard</h1><p>The saved toast is portaled after hydration.</p><Portal><div class="toast">Saved!</div></Portal><p data-result="pass">PASS — the route rendered without an SSR crash.</p></main> }
export const Route = createFileRoute('/')({ component: Home })
