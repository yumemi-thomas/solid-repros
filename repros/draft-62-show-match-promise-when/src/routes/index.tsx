import { createFileRoute } from '@tanstack/solid-router'
import { Loading, Match, Show, Switch } from 'solid-js'

const canEdit = () => Promise.resolve(false)
function Home() {
  return <main><h1>Article permissions</h1><Loading fallback={<p>Checking permissions…</p>}><Show when={canEdit()} fallback={<p data-read-only>Read-only access</p>}><button data-delete>Delete post</button></Show><Switch fallback={<p data-overview>Overview</p>}><Match when={canEdit()}><p data-owner>Owner tools</p></Match></Switch></Loading></main>
}
export const Route = createFileRoute('/')({ component: Home })
