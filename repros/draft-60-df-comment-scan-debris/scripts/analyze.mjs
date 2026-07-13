// Streams the real TanStack Start route and inspects the emitted Solid protocol.
const BASE = process.env.REPRO_BASE ?? 'http://localhost:3000'
const started = Date.now()
// Start intentionally buffers bot responses. Use a browser UA so this checks
// the same incremental streaming path as the StackBlitz preview.
const response = await fetch(BASE + '/', {
  headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0' },
})
const chunks = []
const reader = response.body.getReader()
const decoder = new TextDecoder()

for (;;) {
  const { done, value } = await reader.read()
  if (done) break
  chunks.push({ at: Date.now() - started, text: decoder.decode(value, { stream: true }) })
}

const full = chunks.map(chunk => chunk.text).join('')
const shell = chunks.find(chunk => chunk.text.includes('Preparing file'))
const resolved = chunks.find(chunk => chunk.text.includes('Download ready'))
const hasDynamicSeparators = /Preparing file[^<]*<!--!\$-->42<!--!\$-->% complete/.test(full)
const hasBrokenDf = full.includes('8!==o.nodeType&&o.nodeValue!=="pl-"+e')
const hasActivation = /\$df\("[^"]+"\)/.test(full)
const reproduced = Boolean(shell && resolved && hasDynamicSeparators && hasBrokenDf && hasActivation)

console.log('\nTanStack Start streamed route')
console.log(`  fallback shell at ~${shell?.at ?? 'missing'}ms`)
console.log(`  resolved fragment at ~${resolved?.at ?? 'missing'}ms`)
console.log(`  dynamic <!--!$--> separators: ${hasDynamicSeparators}`)
console.log(`  generated broken $df + activation: ${hasBrokenDf && hasActivation}`)
console.log(
  reproduced
    ? '  FAIL — bug reproduced: the real Start stream emits the broken fragment swap'
    : '  PASS — the stream no longer contains the broken swap shape'
)
