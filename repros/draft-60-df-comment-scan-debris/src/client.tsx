import { hydrate } from '@solidjs/web'
import { StartClient, hydrateStart } from '@tanstack/solid-start/client'

// Deterministically exercise the fully-streamed-before-hydrate case: a cached
// HTML response can finish long before a deferred/slow client bundle executes.
// The server still uses Start's normal streaming path; only hydration waits.
setTimeout(async () => {
  const router = await hydrateStart()
  hydrate(() => <StartClient router={router} />, document)
}, 1800)
