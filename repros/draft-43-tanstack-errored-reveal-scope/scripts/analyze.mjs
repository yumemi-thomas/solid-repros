// Streams both routes and inspects Reveal group membership + activation timing.
// Client semantics (deliberate, test-pinned): an Errored-wrapped Loading is
// NOT a group member. Correct server output for the repro route is therefore a
// 1-key group activating at ~300ms, with the panel activating independently.
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

const groupsOf = chunks =>
  [...chunks.map(c => c.text).join('').matchAll(/\$dfj\((\[[^\]]*\])\)/g)].map(m => JSON.parse(m[1]))

function report(name, ok, detail) {
  console.log(`\n${name}\n  ${detail}\n  ${ok ? 'PASS' : 'FAIL'}`)
  return ok
}

// CONTROL: both slots are direct members — a 2-key group at ~2s is CORRECT.
const control = await streamRoute('/control')
const cGroups = groupsOf(control)
const controlOk = cGroups.length > 0 && cGroups.every(k => k.length === 2)
report('CONTROL /control (no Errored)', controlOk, `groups: ${JSON.stringify(cGroups)} — two direct slots coordinating is correct`)

// REPRO: panel is Errored-wrapped — client semantics say it must NOT be a member.
const repro = await streamRoute('/')
const rGroups = groupsOf(repro)
const activation = repro.find(c => c.text.includes('$dfj'))
const panel = repro.find(c => c.text.includes('Konbini'))
const memberOk = rGroups.length > 0 && rGroups.every(k => k.length === 1)
const timingOk = !!activation && !!panel && activation.at < panel.at
report(
  'REPRO / (Errored-wrapped panel)',
  memberOk && timingOk,
  `groups: ${JSON.stringify(rGroups)}; activation at ~${activation?.at}ms; panel content at ~${panel?.at}ms` +
    (memberOk ? '' : ' — wrapped panel was enrolled into the group') +
    (memberOk && !timingOk ? ' — group held until the wrapped panel resolved' : '')
)

const ok = controlOk && memberOk && timingOk
console.log(
  ok
    ? '\nPASS — server matches client: Errored-wrapped Loading is not a group member'
    : '\nFAIL — server enrolls the Errored-wrapped Loading into the Reveal group (solid issue draft 43); the client does not. Compare: SPA-navigate control ↔ / (order shows at ~300ms) vs hard refresh (everything held to ~2s).'
)
process.exitCode = ok ? 0 : 1
