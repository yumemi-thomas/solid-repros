// Boots TanStack Start, analyzes its streamed response, and leaves the preview running.
import { spawn } from 'node:child_process'

const server = spawn('npx', ['vite', 'dev', '--port', '3000'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
})
server.stdout.on('data', data => process.stdout.write(`[dev] ${data}`))
server.stderr.on('data', data => process.stderr.write(`[dev] ${data}`))
process.on('SIGINT', () => { server.kill('SIGTERM'); process.exit() })

async function waitForServer() {
  for (let i = 0; i < 240; i++) {
    try {
      const response = await fetch('http://localhost:3000/')
      if (response.ok) { await response.text(); return }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error('TanStack Start dev server did not come up on :3000')
}

try {
  await waitForServer()
  await import('./analyze.mjs')
  console.log(
    '\nDev server is still running — open http://localhost:3000/ in the preview.\nPress Ctrl-C to stop.'
  )
} catch (error) {
  console.error(error)
  server.kill('SIGTERM')
  process.exit(1)
}
