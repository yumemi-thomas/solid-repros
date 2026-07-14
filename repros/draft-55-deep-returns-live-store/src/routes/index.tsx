import { createFileRoute } from '@tanstack/solid-router'
import { createStore, deep, untrack } from 'solid-js'

function Home() {
  const [profile] = createStore({ user: { name: 'Grace' } })
  const payload = deep(profile)
  untrack(() => { payload.user.name = payload.user.name.toUpperCase() })
  const ok = payload !== profile && profile.user.name === 'Grace'
  return <main><h1>Profile export</h1><p>Store: {profile.user.name}</p><p>Normalized payload: {payload.user.name}</p><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — export normalization {ok ? 'left the live store alone' : 'mutated the live store'}.</p></main>
}
export const Route = createFileRoute('/')({ component: Home })
