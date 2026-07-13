// Loaded before TanStack Start's client bundle. This records every status-node
// mutation so a fast client re-render cannot hide the broken streamed swap.
const expected = 'Download ready'
const status = document.querySelector('[data-report-status]')
const observations = []
let corrupted = false

function capture(phase) {
  const text = status?.textContent?.trim() ?? '<missing>'
  observations.push({ phase, text })
  if (text.includes(expected) && text !== expected) corrupted = true
}

capture('initial shell')

const observer = new MutationObserver(() => capture('DOM mutation'))
if (status) observer.observe(status, { childList: true, characterData: true, subtree: true })

setTimeout(() => {
  capture('settled')
  observer.disconnect()

  const verdict = document.getElementById('verdict')
  const streamed = observations.find(entry => entry.text.includes(expected))?.text ?? '<never resolved>'
  const final = status?.textContent?.trim() ?? '<missing>'
  const failed = corrupted || final !== expected

  window.__dfRepro = { expected, streamed, final, observations, failed }
  verdict.className = `verdict ${failed ? 'fail' : 'pass'}`
  verdict.innerHTML = `
    <strong>${failed ? 'FAIL — bug reproduced' : 'PASS — fallback fully removed'}</strong>
    <span>Expected: ${JSON.stringify(expected)}</span>
    <span>Stream mutation: ${JSON.stringify(streamed)}</span>
    <span>Settled DOM: ${JSON.stringify(final)}</span>
  `
  console.log(window.__dfRepro)
}, 2200)
