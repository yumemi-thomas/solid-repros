// Streams a route from the running TanStack Start dev server, records chunk
// arrival times, and inspects the Reveal activation scripts ($dfj group keys).
const BASE = process.env.REPRO_BASE ?? 'http://localhost:3000'

async function streamRoute(path) {
  const started = Date.now()
  const res = await fetch(BASE + path)
  const chunks = []
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push({ at: Date.now() - started, text: decoder.decode(value, { stream: true }) })
  }
  return chunks
}

function inspect(name, chunks, { expectNested }) {
  const full = chunks.map(c => c.text).join('')
  const groups = [...full.matchAll(/\$dfj\((\[[^\]]*\])\)/g)].map(m => JSON.parse(m[1]))
  const activation = chunks.find(c => c.text.includes('$dfj'))
  const recommendations = chunks.find(c => c.text.includes('Camp Stove'))

  const directSlotsOnly = groups.length > 0 && groups.every(keys => keys.length === 2)
  const groupNotHeld =
    !expectNested || (activation && recommendations && activation.at < recommendations.at)

  console.log(`\n${name}`)
  console.log(`  reveal groups: ${JSON.stringify(groups)}`)
  console.log(`  group activation at ~${activation?.at}ms` +
    (expectNested ? `; recommendations content at ~${recommendations?.at}ms` : ''))
  const ok = directSlotsOnly && groupNotHeld
  console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${
    ok
      ? 'group contains only the two direct slots and released without waiting'
      : !directSlotsOnly
        ? 'nested Loading was enrolled into the ancestor Reveal group'
        : 'group activation was held until the nested boundary resolved'
  }`)
  return ok
}

const control = inspect('CONTROL /control (no nested boundary)', await streamRoute('/control'), {
  expectNested: false
})
const repro = inspect('REPRO / (nested recommendations boundary)', await streamRoute('/'), {
  expectNested: true
})

console.log(
  control && repro
    ? '\nPASS — bug is fixed: nested boundaries reveal independently'
    : '\nFAIL — nested <Loading> joined the ancestor <Reveal> group (solid issue draft 01)'
)
process.exitCode = control && repro ? 0 : 1
