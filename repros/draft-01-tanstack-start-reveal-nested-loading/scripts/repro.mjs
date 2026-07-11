// Boots the TanStack Start dev server, streams the control and repro routes,
// prints the PASS/FAIL verdict, then LEAVES the server running so the page can
// be browsed (StackBlitz opens the preview automatically; Ctrl-C to stop).
import { spawn } from 'node:child_process'

const server = spawn('npx', ['vite', 'dev', '--port', '3000'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env }
})
server.stdout.on('data', d => process.stdout.write(`[dev] ${d}`))
server.stderr.on('data', d => process.stderr.write(`[dev] ${d}`))
process.on('SIGINT', () => { server.kill('SIGTERM'); process.exit() })

async function waitForServer() {
  for (let i = 0; i < 240; i++) {
    try {
      const res = await fetch('http://localhost:3000/control')
      if (res.ok) { await res.text(); return }
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error('dev server did not come up on :3000')
}

try {
  await waitForServer()
  // warm both routes once — the first hit pays module transform cost
  await (await fetch('http://localhost:3000/')).text()
  await new Promise(r => setTimeout(r, 500))
  await import('./analyze.mjs')
  console.log(
    '\nDev server is still running — open http://localhost:3000/ (repro) and /control in the preview to watch the skeletons.\nPress Ctrl-C to stop.'
  )
} catch (err) {
  console.error(err)
  server.kill('SIGTERM')
  process.exit(1)
}
