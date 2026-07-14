import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, resolve } from 'solid-js'

export const Route = createFileRoute('/')({ loader: async () => { const user = createMemo(async () => ({ name: 'Ada' })); return { name: await resolve(() => user().name) } }, component: Home })
function Home() { const user = Route.useLoaderData(); return <main><h1>User</h1><p data-result="pass">PASS — resolved {user().name} during SSR.</p></main> }
