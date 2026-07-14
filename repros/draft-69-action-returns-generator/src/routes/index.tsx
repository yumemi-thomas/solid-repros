import { createFileRoute } from '@tanstack/solid-router'
import { action } from 'solid-js'

let executed = false
const saveNote = action(function* (text: string) { executed = true; yield Promise.resolve(); return `saved: ${text}` })
export const Route = createFileRoute('/')({
  loader: async () => { executed = false; const result = saveNote('hello') as any; return { executed, promise: typeof result?.then === 'function', tag: result?.[Symbol.toStringTag] } },
  component: Home,
})
function Home() { const result = Route.useLoaderData(); const ok = () => result().executed && result().promise; return <main><h1>Save note</h1><p>Body executed: {String(result().executed)}</p><p>Return type: {String(result().tag)}</p><p data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS' : 'FAIL'} — server action {ok() ? 'ran' : 'returned a raw generator'}.</p></main> }
