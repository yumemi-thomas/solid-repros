import { spawn } from 'node:child_process'
const child = spawn('npx', ['vite', 'dev', '--port', '3000'], { stdio: ['ignore', 'pipe', 'pipe'] })
child.stdout.on('data', data => process.stdout.write('[dev] ' + data))
child.stderr.on('data', data => process.stderr.write('[dev] ' + data))
process.on('SIGINT', () => child.kill('SIGTERM'))
for (let i = 0; i < 120; i++) {
  try {
    const response = await fetch('http://localhost:3000/', { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124' }, signal: AbortSignal.timeout(2500) })
    const html = await response.text()
    if (response.status === 503) continue
    const pass = response.ok && (html.includes('data-result="pass"') || html.includes('data-read-only') && html.includes('data-overview') && !html.includes('data-delete') && !html.includes('data-owner') || html.includes('data-content') && !html.includes('data-effect-fallback') || html.includes('data-pricing-error') && !html.includes('data-seed') || html.includes('data-panel-error') || html.includes('data-not-found') || html.includes('data-card') && !html.includes('style=";') && !html.includes('class=" '))
    console.log('\n' + (pass ? 'PASS — expected SSR behavior' : 'FAIL — bug reproduced in the TanStack Start route'))
    console.log('HTTP', response.status)
    break
  } catch (error) {
    if (error?.name === 'TimeoutError') { console.log('\nFAIL — SSR response did not finish within 2.5s'); break }
  }
  await new Promise(resolve => setTimeout(resolve, 500))
}
console.log('Dev server remains at http://localhost:3000/ (Ctrl-C to stop).')
