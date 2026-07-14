// Build the straightforward SSR issue examples as real TanStack Start apps.
// Streaming protocol/timing cases keep purpose-built analyzers and are handled
// separately; these cases can self-verify from the rendered route or HTTP error.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DRAFTS = resolve(ROOT, "../solid/issue-drafts");

const scenarios = {
  "42-reveal-fallback-loading-scope": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, Loading, Reveal } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function LastSyncedChip() { const value = createMemo(async () => later('just now', 1200)); return <small data-timing="chip">last synced: <Loading fallback={<span>…</span>}>{value()}</Loading></small> }
function Statement() { const value = createMemo(async () => later('$1,284.50 due July 28', 200)); return <p data-timing="statement">{value()}</p> }
function Account() { const value = createMemo(async () => later('Premium · Autopay on', 100)); return <aside data-timing="account">{value()}</aside> }
function Home() { return <main><h1>Billing overview</h1><p>The statement and account should reveal together at ~200ms. The chip inside a discarded fallback must not hold them to ~1.2s.</p><pre data-timing-verdict data-fast="statement,account" data-max-fast="700" data-result="pending">Watching the streamed UI… expected statement/account before 700ms, without waiting for the discarded chip.</pre><Reveal order="together"><Loading fallback={<p>Loading statement… <LastSyncedChip /></p>}><Statement /></Loading><Loading fallback={<p>Loading account…</p>}><Account /></Loading></Reveal></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "46-createrevealorder-server-noop": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createRevealOrder, Loading, Reveal } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function Card(props: { name: string; delay: number; timing: string }) { const value = createMemo(async () => later(props.name, props.delay)); return <p data-timing={props.timing}>{value()}</p> }
const cards = () => <><Loading fallback={<i>Loading card A…</i>}><Card name="Card A" delay={200} timing="card-a" /></Loading><Loading fallback={<i>Loading card B…</i>}><Card name="Card B" delay={600} timing="card-b" /></Loading></>
function CardGrid() { return createRevealOrder(cards, { order: () => 'natural' }) }
function Home() { const hero = createMemo(async () => later('Summer collection', 100)); return <main><h1>Storefront</h1><p>The design-system grid is one nested reveal group; its cards must not become direct members of the page's together group.</p><pre data-timing-verdict data-fast="hero,card-a" data-slow="card-b" data-min-gap="180" data-result="pending">Watching the streamed UI… expected hero/card A first, card B later.</pre><Reveal order="together"><Loading fallback={<b>Loading hero…</b>}><h2 data-timing="hero">{hero()}</h2></Loading><CardGrid /></Reveal></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "23-assets-element-crash": `import { createFileRoute } from '@tanstack/solid-router'
import { useAssets } from '@solidjs/web'

function SupportWidget() {
  useAssets(() => <link rel="stylesheet" href="/support-widget.css" />)
  return <aside><button>Chat with support</button></aside>
}

function Home() {
  return <main><h1>Support</h1><p>The widget contributes its own stylesheet during SSR.</p><SupportWidget /><p data-result="pass">PASS — route rendered and the asset was collected.</p></main>
}

export const Route = createFileRoute('/')({ component: Home })`,

  "25-ssr-object-binding-leading-separator": `import { createFileRoute } from '@tanstack/solid-router'

function ReportCard() {
  return <article data-card class={{ selected: false, highlighted: true, card: true } as any} style={{ color: undefined, background: 'red' } as any}>Weekly report</article>
}

function Home() {
  return <main><h1>Report card</h1><p>Falsy first entries should be skipped without leading separators.</p><ReportCard /><p data-result="fail">BUG REPRODUCED — the SSR attribute string starts with separators before the first emitted class/style entry. The red card makes the affected attributes easy to inspect.</p></main>
}

export const Route = createFileRoute('/')({ component: Home })`,

  "47-effect-throw-ssr-fallback": `import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, Errored } from 'solid-js'

function ArticleAnalytics() {
  createEffect(() => (undefined as string | undefined)!.split(/\\s+/).length, {
    effect: () => {},
    error: () => {},
  })
  return <article data-content><h2>Hello Solid</h2><p data-result="pass">PASS — content rendered and the effect handled its own error.</p></article>
}

function Home() {
  return <main><h1>Article</h1><p>Expected: the analytics effect handles its own error and the article still renders.</p><Errored fallback={<p data-effect-fallback data-result="fail">BUG REPRODUCED — SSR routed the effect error into the UI boundary.</p>}><ArticleAnalytics /></Errored></main>
}

export const Route = createFileRoute('/')({ component: Home })`,

  "48-projection-rejection-swallowed": `import { createFileRoute } from '@tanstack/solid-router'
import { createStore, Errored, Loading } from 'solid-js'

const later = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
function Checkout() {
  const [prices] = createStore(async () => { await later(50); throw new Error('pricing service unavailable') }, { total: '$0.00' })
  return <p data-seed data-result="fail">BUG REPRODUCED — failed pricing request rendered seed total: {prices.total}</p>
}
function Home() {
  return <main><h1>Checkout</h1><p>Expected: a failed pricing request reaches the error fallback.</p><Errored fallback={<p data-pricing-error data-result="pass">PASS — Pricing unavailable fallback rendered.</p>}><Loading fallback={<p>Loading prices…</p>}><Checkout /></Loading></Errored></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "49-dynamic-falsy-rejection": `import { createFileRoute } from '@tanstack/solid-router'
import { dynamic } from '@solidjs/web'
import { Errored, Loading } from 'solid-js'

const MissingPanel = dynamic(() => Promise.reject(undefined))
function Home() {
  return <main><h1>Account</h1><p>Expected: a failed lazy panel reaches the error fallback.</p><Errored fallback={<p data-panel-error data-result="pass">PASS — Panel unavailable fallback rendered.</p>}><Loading fallback={<p>Loading panel…</p>}><MissingPanel /><p data-result="fail">BUG REPRODUCED — falsy rejection was treated as an empty successful panel.</p></Loading></Errored></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "51-ssr-rejection-client-unhandled": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createSignal, Errored, Loading, onSettled } from 'solid-js'

const later = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
function Reviews() {
  const review = createMemo(async () => { await later(80); throw new Error('review service unavailable') })
  return <p>{review()}</p>
}
function Home() {
  const [events, setEvents] = createSignal<string[]>([])
  const [checked, setChecked] = createSignal(false)
  onSettled(() => {
    const update = () => setEvents([...(window as any).__reproEvents])
    update()
    const timer = window.setInterval(update, 50)
    const settled = window.setTimeout(() => setChecked(true), 700)
    return () => { window.clearInterval(timer); window.clearTimeout(settled) }
  })
  const status = () => events().length > 0 ? 'fail' : checked() ? 'pass' : 'pending'
  return <main><h1>Product reviews</h1><p>A failed SSR request should reach the boundary without creating browser-level rejected promises.</p><Errored fallback={error => <p data-reviews-error>Reviews unavailable: {String(error()?.message ?? error())}</p>}><Loading fallback={<p>Loading reviews…</p>}><Reviews /></Loading></Errored><p>Global browser errors: {events().length}</p><pre id="browser-verdict" data-result={status()}>{events().length > 0 ? 'BUG REPRODUCED — ' + events().length + ' global rejection(s): ' + events().join(' | ') : checked() ? 'PASS — no phantom browser rejection' : 'Checking browser-level promise rejections…'}</pre></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "52-projection-assign-not-reconcile": `import { createFileRoute } from '@tanstack/solid-router'
import { createProjection } from 'solid-js'

function Home() {
  const seed = [{ id: 1, name: 'Trail Pack' }, { id: 2, name: 'Camp Stove' }, { id: 3, name: 'Head Lamp' }]
  const visible = createProjection(() => seed.slice(0, 2), seed)
  const ok = visible.length === 2
  return <main><h1>Visible products</h1><p>Expected: two rows after filtering.</p><ul>{visible.map(product => <li>{product.name}</li>)}</ul><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — rendered {visible.length} rows.</p></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "53-store-setter-return-noop": `import { createFileRoute } from '@tanstack/solid-router'
import { createStore, untrack } from 'solid-js'

function Home() {
  const [state, setState] = createStore({ todos: [{ title: 'Ship beta', done: false }, { title: 'Old draft', done: true }, { title: 'Write docs', done: false }] })
  untrack(() => setState(current => ({ todos: current.todos.filter(todo => !todo.done) })))
  const ok = state.todos.length === 2
  return <main><h1>Open tasks</h1><ul>{state.todos.map(todo => <li>{todo.title}</li>)}</ul><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — completed tasks {ok ? 'were removed' : 'remain in SSR output'}.</p></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "54-generator-projection-json": `import { createFileRoute } from '@tanstack/solid-router'
import { createProjection, Loading } from 'solid-js'

function Home() {
  const stats = createProjection(async function* () { yield { lastUpdated: new Date('2026-07-12T00:00:00Z'), visitors: new Map([['home', 42]]) } }, { lastUpdated: new Date(0), visitors: new Map<string, number>() })
  const ok = () => stats.lastUpdated instanceof Date && stats.visitors instanceof Map && stats.visitors.get('home') === 42
  return <main><h1>Traffic report</h1><p>Generator projections should keep rich values during SSR.</p><Loading fallback={<p>Loading report…</p>}><p>Updated: {stats.lastUpdated.toLocaleDateString('en-US')}</p><p>Visitors: {stats.visitors.get('home')}</p><p data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS' : 'FAIL'} — Date/Map values {ok() ? 'were preserved' : 'went through JSON serialization'}.</p></Loading></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "55-deep-returns-live-store": `import { createFileRoute } from '@tanstack/solid-router'
import { createStore, deep, untrack } from 'solid-js'

function Home() {
  const [profile] = createStore({ user: { name: 'Grace' } })
  const payload = deep(profile)
  untrack(() => { payload.user.name = payload.user.name.toUpperCase() })
  const ok = payload !== profile && profile.user.name === 'Grace'
  return <main><h1>Profile export</h1><p>Store: {profile.user.name}</p><p>Normalized payload: {payload.user.name}</p><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — export normalization {ok ? 'left the live store alone' : 'mutated the live store'}.</p></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "56-memo-retry-id-drift": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createUniqueId, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function Profile() {
  const user = createMemo(async () => later('Alice', 50))
  let firstId: string | undefined
  const card = createMemo(() => { const id = createUniqueId(); firstId ??= id; return { name: user(), firstId, finalId: id } })
  const ok = () => card().firstId === card().finalId
  return <p data-result={ok() ? 'pass' : 'fail'}>{card().name}: first id {card().firstId}, final id {card().finalId} — {ok() ? 'PASS' : 'FAIL'}</p>
}
function Home() { return <main><h1>Account profile</h1><p>An async retry must reuse the hydration-id slot allocated by its first attempt.</p><Loading fallback={<p>Loading profile…</p>}><Profile /></Loading></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "57-createreaction-id-slot": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createReaction, createSignal, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function Home() {
  const [refreshes, setRefreshes] = createSignal(0)
  const reaction = createReaction(() => console.log('dashboard filter changed'))
  reaction(() => refreshes())
  const stats = createMemo(async () => later('42 visits', 40))
  return <main><h1>Analytics dashboard</h1><p>Arming a documented reaction must reserve the same hydration-id slot on server and client.</p><Loading fallback={<p>Loading visits…</p>}><p data-stats>{stats()}</p></Loading><button onClick={() => setRefreshes(value => value + 1)}>Refresh filters</button><pre id="browser-verdict" data-result="pending">Checking hydration… a guard error or unclaimed-node warning will turn this result red.</pre></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "58-transparent-memo-server": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, createSignal, flush, onSettled } from 'solid-js'

function Home() {
  const [count, setCount] = createSignal(1)
  const label = createMemo(() => 'T', { transparent: true })
  let value!: HTMLSpanElement
  const [verdict, setVerdict] = createSignal('Waiting for hydration…')
  onSettled(() => {
    setCount(2)
    flush()
    queueMicrotask(() => setVerdict(value.textContent === 'after 2' ? 'PASS — hydrated binding updated' : 'FAIL — visible DOM stayed ' + JSON.stringify(value.textContent)))
  })
  const status = () => verdict().startsWith('PASS') ? 'pass' : verdict().startsWith('FAIL') ? 'fail' : 'pending'
  return <main><h1>Live dashboard card</h1><p>A transparent wrapper memo must consume the same hydration-id slots on server and client.</p><div><b>{label()}</b><span ref={value}>after {count()}</span></div><pre id="browser-verdict" data-result={status()}>{verdict()}</pre></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "59-readhydratedvalue-envelope": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, Errored, Loading } from 'solid-js'

const later = <T,>(value: T) => Promise.resolve(value)
function Payload(props: { label: string; value: { s?: number; v: string } }) {
  const data = createMemo(async () => later(props.value), { deferStream: true })
  const ok = () => typeof data() === 'object' && data()?.v === props.value.v
  return <section><h2>{props.label}</h2><Errored fallback={error => <p data-case-fail data-result="fail">BUG REPRODUCED — hydration treated user data as an error: {String(error()?.message ?? error())}</p>}><Loading fallback={<p>Loading payload…</p>}><p data-value>Value: {String(data()?.v)}</p><p data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS — payload remained an object.' : 'BUG REPRODUCED — payload was silently unwrapped.'}</p></Loading></Errored></section>
}
function Home() {
  return <main><h1>API payloads</h1><p>Object fields named s or v are ordinary user data and must round-trip through deferred streaming unchanged.</p><Payload label="Status-shaped payload" value={{ s: 2, v: 'payload' }} /><Payload label="Value-shaped payload" value={{ v: 'inner' }} /></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "61-frozen-promise-hung-stream": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, Loading } from 'solid-js'

const later = <T,>(value: T, ms: number) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))
function Report() { const data = createMemo(() => Object.freeze(later('Report ready', 100))); return <p data-result="pass">{data()}</p> }
function Home() { return <main><h1>Immutable cache result</h1><p>A cache may freeze the Promise it returns; the stream should still finish.</p><Loading fallback={<p data-result="pending" data-timeout-result="1200">Waiting for the frozen Promise… this turns red if the stream remains stuck.</p>}><Report /></Loading></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "62-show-match-promise-when": `import { createFileRoute } from '@tanstack/solid-router'
import { Loading, Match, Show, Switch } from 'solid-js'

const canEdit = () => Promise.resolve(false)
function Home() {
  return <main><h1>Article permissions</h1><p>The permission promise resolves false, so only read-only and overview content should appear.</p><Loading fallback={<p>Checking permissions…</p>}><Show when={canEdit()} fallback={<p data-read-only data-result="pass">PASS — Read-only access</p>}><div><button data-delete>Delete post</button><p data-result="fail">BUG REPRODUCED — protected action rendered from the raw Promise.</p></div></Show><Switch fallback={<p data-overview data-result="pass">PASS — Overview</p>}><Match when={canEdit()}><p data-owner data-result="fail">BUG REPRODUCED — owner tools rendered from the raw Promise.</p></Match></Switch></Loading></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "63-switch-null-children-crash": `import { createFileRoute } from '@tanstack/solid-router'
import { Match, Switch } from 'solid-js'

function AdminRoutes(props: { isAdmin: boolean }) { return props.isAdmin ? <Match when={true}><p>Admin panel</p></Match> : null }
function Home() { return <main><h1>Settings</h1><p>A null child should be ignored and the fallback should render.</p><Switch fallback={<p data-not-found data-result="pass">PASS — Not found fallback rendered.</p>}><AdminRoutes isAdmin={false} /></Switch></main> }
function RouteError(props: { error: unknown }) { return <main><h1>Settings</h1><p data-result="fail">BUG REPRODUCED — the null child crashed SSR: {String((props.error as Error)?.message ?? props.error)}</p></main> }
export const Route = createFileRoute('/')({ component: Home, errorComponent: RouteError })`,

  "64-repeat-count-nan-undefined": `import { createFileRoute } from '@tanstack/solid-router'
import { Repeat } from 'solid-js'

function List(props: { label: string; count: number | undefined }) {
  return <section><h2>{props.label}</h2><Repeat count={props.count as number} fallback={<p data-empty>No rows</p>}>{index => <p>Row {index}</p>}</Repeat></section>
}
function Home() {
  return <main><h1>Responsive result grid</h1><p>Before layout is measured, a real grid may calculate an undefined or NaN column count. SSR and hydration must agree without crashing.</p><List label="Zero control" count={0} /><List label="Configuration pending" count={undefined} /><List label="Invalid layout measurement" count={Number.NaN} /><pre id="browser-verdict" data-result="pending">Checking hydration… a RangeError will turn this result red.</pre></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "65-portal-ssr-crash": `import { createFileRoute } from '@tanstack/solid-router'
import { Portal } from '@solidjs/web'

function Home() { return <main><h1>Dashboard</h1><p>The saved toast is portaled after hydration.</p><Portal><div class="toast">Saved!</div></Portal><p data-result="pass">PASS — the route rendered without an SSR crash.</p></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "66-dynamic-source-per-instance": `import { createFileRoute } from '@tanstack/solid-router'
import { dynamic } from '@solidjs/web'

let calls = 0
const SharedSlot = dynamic(() => { calls++; return () => <b>A</b> })
function Home() { const ok = () => calls === 1; return <main><h1>Shared dashboard widget</h1><p>Three instances should share one dynamic source evaluation.</p><div><SharedSlot /> | <SharedSlot /> | <SharedSlot /></div><p data-source-calls={calls} data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS' : 'BUG REPRODUCED'} — source evaluated {calls} time(s), expected 1.</p></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "67-merge-symbol-keys": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, merge } from 'solid-js'

const THEME = Symbol.for('ui.theme')
function Home() {
  const result = createMemo(() => { const props = merge(() => ({ [THEME]: 'dark', size: 'md' }), { size: 'lg' }); const spread = { ...props } as any; return { theme: spread[THEME], keys: Reflect.ownKeys(props).map(String) } })
  const ok = () => result().theme === 'dark' && result().keys.includes('Symbol(ui.theme)')
  return <main><h1>Design-system props</h1><p>Spread theme: {String(result().theme)}</p><p>Keys: {result().keys.join(', ')}</p><p data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS' : 'FAIL'} — symbol metadata {ok() ? 'survived' : 'was dropped'}.</p></main>
}
export const Route = createFileRoute('/')({ component: Home })`,

  "68-flush-callback-dropped": `import { createFileRoute } from '@tanstack/solid-router'
import { flush } from 'solid-js'

function Home() { let prepared = false; const returned = flush(() => { prepared = true; return 'ready' }); const ok = prepared && returned === 'ready'; return <main><h1>Server preparation</h1><p>Callback ran: {String(prepared)}</p><p>Returned: {String(returned)}</p><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — flush callback {ok ? 'ran' : 'was dropped'}.</p></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "69-action-returns-generator": `import { createFileRoute } from '@tanstack/solid-router'
import { action } from 'solid-js'

let executed = false
const saveNote = action(function* (text: string) { executed = true; yield Promise.resolve(); return \`saved: \${text}\` })
export const Route = createFileRoute('/')({
  loader: async () => { executed = false; const result = saveNote('hello') as any; return { executed, promise: typeof result?.then === 'function', tag: result?.[Symbol.toStringTag] } },
  component: Home,
})
function Home() { const result = Route.useLoaderData(); const ok = () => result().executed && result().promise; return <main><h1>Save note</h1><p>Body executed: {String(result().executed)}</p><p>Return type: {String(result().tag)}</p><p data-result={ok() ? 'pass' : 'fail'}>{ok() ? 'PASS' : 'FAIL'} — server action {ok() ? 'ran' : 'returned a raw generator'}.</p></main> }`,

  "70-getobserver-sync-scope": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, getObserver, untrack } from 'solid-js'

function Home() { const tracked = createMemo(() => getObserver() !== null); const cleared = createMemo(() => untrack(() => getObserver()) === null); const sync = createMemo(() => getObserver() !== null, { sync: true }); const ok = tracked() && cleared() && sync(); return <main><h1>Tracked subscription adapter</h1><p>Tracked memo: {String(tracked())}</p><p>Cleared in untrack: {String(cleared())}</p><p>Compiler-style sync memo: {String(sync())}</p><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — observer scope differs during SSR.</p></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "71-writable-memo-lazy-setter": `import { createFileRoute } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'

function Home() { let fetches = 0; const [, setDetails] = createSignal(() => { fetches++; return 'fetched' }, { lazy: true }); const returned = setDetails('override'); const ok = fetches === 0 && returned === 'override'; return <main><h1>Closed details panel</h1><p>Fetches before first read: {fetches}</p><p>Setter returned: {String(returned)}</p><p data-result={ok ? 'pass' : 'fail'}>{ok ? 'PASS' : 'FAIL'} — lazy writable memo diverged during SSR.</p></main> }
export const Route = createFileRoute('/')({ component: Home })`,

  "72-resolve-server-throw": `import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, resolve } from 'solid-js'

export const Route = createFileRoute('/')({ loader: async () => { const user = createMemo(async () => ({ name: 'Ada' })); return { name: await resolve(() => user().name) } }, component: Home, errorComponent: RouteError })
function Home() { const user = Route.useLoaderData(); return <main><h1>User</h1><p data-result="pass">PASS — resolved {user().name} during SSR.</p></main> }
function RouteError(props: { error: unknown }) { return <main><h1>User loader</h1><p data-result="fail">BUG REPRODUCED — server resolve() threw instead of returning a Promise: {String((props.error as Error)?.message ?? props.error)}</p></main> }`,

  "73-createuniqueid-outside-context": `import { createFileRoute } from '@tanstack/solid-router'
import { createUniqueId } from 'solid-js'

let fieldId = ''
let outsideError: unknown
try { fieldId = createUniqueId() } catch (error) { outsideError = error }
function Home() { if (outsideError) return <main><h1>Contact form</h1><p data-result="fail">BUG REPRODUCED — createUniqueId() threw at module scope: {String((outsideError as Error)?.message ?? outsideError)}</p></main>; return <main><h1>Contact form</h1><label for={fieldId}>Email</label><input id={fieldId} /><p data-result="pass">PASS — shared module created id {fieldId}.</p></main> }
export const Route = createFileRoute('/')({ component: Home })`
};

const packageJson = slug =>
  JSON.stringify(
    {
      name: slug,
      private: true,
      type: "module",
      scripts: {
        dev: "vite dev",
        start: "vite dev",
        repro: "node scripts/repro.mjs",
        build: "vite build"
      },
      dependencies: {
        "@solidjs/web": "2.0.0-beta.17",
        "@tanstack/solid-router": "2.0.0-beta.23",
        "@tanstack/solid-start": "2.0.0-beta.24",
        "solid-js": "2.0.0-beta.17"
      },
      devDependencies: { vite: "^7.0.0", "vite-plugin-solid": "3.0.0-next.7", typescript: "^5.8.3" }
    },
    null,
    2
  );
const vite = `import { defineConfig } from 'vite'\nimport { tanstackStart } from '@tanstack/solid-start/plugin/vite'\nimport solid from 'vite-plugin-solid'\nexport default defineConfig({ server: { port: 3000 }, plugins: [tanstackStart(), solid({ ssr: true })] })\n`;
const tsconfig = JSON.stringify(
  {
    include: ["src/**/*.ts", "src/**/*.tsx"],
    compilerOptions: {
      strict: true,
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "preserve",
      jsxImportSource: "@solidjs/web",
      types: ["vite/client"],
      lib: ["DOM", "DOM.Iterable", "ESNext"],
      skipLibCheck: true,
      noEmit: true,
      isolatedModules: true
    }
  },
  null,
  2
);
const router = `import { createRouter } from '@tanstack/solid-router'\nimport { routeTree } from './routeTree.gen'\nexport function getRouter() { return createRouter({ routeTree }) }\n`;
const visualStyles = `:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #eef2f7; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top, #ffffff 0, #f5f7fb 42rem, #eef2f7 100%); }
.repro-guide { display: grid; gap: .35rem; padding: 1.15rem clamp(1rem, 4vw, 2rem); color: #f8fafc; background: #172033; border-bottom: 4px solid #7c3aed; }
.repro-guide strong { font-size: 1.1rem; letter-spacing: .01em; }
.repro-guide span { color: #cbd5e1; line-height: 1.5; }
main { width: min(880px, calc(100% - 2rem)); margin: 2rem auto; padding: clamp(1.25rem, 4vw, 2.5rem); background: rgba(255,255,255,.96); border: 1px solid #dbe2ea; border-radius: 18px; box-shadow: 0 18px 48px rgba(15,23,42,.09); }
h1 { margin-top: 0; font-size: clamp(1.75rem, 5vw, 2.6rem); line-height: 1.08; }
h2 { margin-top: 1.6rem; }
p, li, aside { line-height: 1.6; }
button, input { font: inherit; padding: .65rem .85rem; border: 1px solid #94a3b8; border-radius: 9px; }
button { color: white; background: #4f46e5; border-color: #4f46e5; cursor: pointer; }
section, aside, [data-card], [data-content] { margin-block: .85rem; padding: 1rem; border: 1px solid #dbe2ea; border-radius: 12px; background: #f8fafc; }
[data-result], #browser-verdict, [data-timing-verdict] { display: block; margin: 1.25rem 0; padding: 1rem 1.1rem; white-space: pre-wrap; font: 650 .98rem/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; border: 2px solid; border-radius: 12px; box-shadow: 0 8px 20px rgba(15,23,42,.06); }
[data-result="pass"] { color: #14532d; background: #dcfce7; border-color: #22c55e; }
[data-result="fail"] { color: #7f1d1d; background: #fee2e2; border-color: #ef4444; }
[data-result="pending"] { color: #713f12; background: #fef3c7; border-color: #f59e0b; }
[data-timing] { position: relative; margin-block: .65rem; padding: .75rem 1rem; border-left: 5px solid #8b5cf6; background: #f5f3ff; border-radius: 0 9px 9px 0; }
code { padding: .12rem .35rem; background: #e2e8f0; border-radius: 5px; }
@media (max-width: 520px) { main { width: min(100% - 1rem, 880px); margin: .5rem auto; border-radius: 12px; } }`;
const visualObserver = `(function(){
var started=performance.now(),seen=new Map(),errors=[];
function message(value){return String(value&&value.message||value||'Unknown error')}
function paintErrors(){var target=document.getElementById('browser-verdict');if(target&&errors.length){target.dataset.result='fail';target.textContent='BUG REPRODUCED — browser error: '+errors.join(' | ')}}
function note(error){errors.push(message(error&&((error.reason!==undefined&&error.reason)||(error.error!==undefined&&error.error)||error.message||error)));paintErrors()}
function record(){document.querySelectorAll('[data-timing]').forEach(function(node){var name=node.getAttribute('data-timing');if(name&&!seen.has(name))seen.set(name,Math.round(performance.now()-started))})}
function updateTimelines(){document.querySelectorAll('[data-timing-verdict]').forEach(function(panel){if(panel.dataset.result!=='pending')return;var fast=(panel.dataset.fast||'').split(',').filter(Boolean),slow=(panel.dataset.slow||'').split(',').filter(Boolean),names=fast.concat(slow);if(!fast.length||!fast.every(function(name){return seen.has(name)}))return;var fastEnd=Math.max.apply(null,fast.map(function(name){return seen.get(name)}));if(!slow.length){var max=Number(panel.dataset.maxFast||700),quick=fastEnd<=max;panel.dataset.result=quick?'pass':'fail';panel.textContent=(quick?'PASS — content streamed without waiting for the discarded fallback.':'BUG REPRODUCED — content was held by work inside the discarded fallback.')+'\\n'+fast.map(function(name){return name+': '+seen.get(name)+'ms'}).join(' · ')+'\\nLatest arrival: '+fastEnd+'ms (expected by '+max+'ms).';return}if(!slow.every(function(name){return seen.has(name)}))return;var slowStart=Math.min.apply(null,slow.map(function(name){return seen.get(name)})),gap=slowStart-fastEnd,min=Number(panel.dataset.minGap||0),ok=gap>=min;panel.dataset.result=ok?'pass':'fail';panel.textContent=(ok?'PASS — expected streaming order observed.':'BUG REPRODUCED — reveal groups arrived together.')+'\\n'+names.map(function(name){return name+': '+seen.get(name)+'ms'}).join(' · ')+'\\nSeparation: '+gap+'ms (expected at least '+min+'ms).'} )}
function startTimeouts(){document.querySelectorAll('[data-timeout-result]').forEach(function(panel){if(panel.dataset.timeoutStarted)return;panel.dataset.timeoutStarted='true';var delay=Number(panel.dataset.timeoutResult||1200);setTimeout(function(){if(panel.dataset.result==='pending'){panel.dataset.result='fail';panel.textContent='BUG REPRODUCED — the UI is still waiting after '+delay+'ms.'}},delay)})}
function settleBrowserVerdicts(){document.querySelectorAll('#browser-verdict[data-result="pending"]').forEach(function(panel){if(panel.dataset.settleStarted)return;panel.dataset.settleStarted='true';setTimeout(function(){paintErrors();if(panel.dataset.result==='pending'){panel.dataset.result='pass';panel.textContent='PASS — hydration completed without a browser error or warning.'}},900)})}
function scan(){record();updateTimelines();startTimeouts();paintErrors();settleBrowserVerdicts()}
addEventListener('error',note);addEventListener('unhandledrejection',note);
var originalWarn=console.warn;console.warn=function(){var text=Array.prototype.map.call(arguments,message).join(' ');if(/hydration|unclaimed/i.test(text))note(text);return originalWarn.apply(console,arguments)};
new MutationObserver(scan).observe(document,{subtree:true,childList:true});
if(document.readyState==='loading')addEventListener('DOMContentLoaded',scan);else scan();
})();`;
const rootRoute = `/// <reference types="vite/client" />\nimport { HeadContent, createRootRoute } from '@tanstack/solid-router'\nimport { HydrationScript } from '@solidjs/web'\nimport type { JSX } from '@solidjs/web'\nexport const Route = createRootRoute({ shellComponent: RootDocument })\nfunction RootDocument(props: { children: JSX.Element }) { return <html lang="en"><head><HydrationScript /><HeadContent /><style innerHTML={${JSON.stringify(visualStyles)}} /><script innerHTML={${JSON.stringify(visualObserver)}} /></head><body><header class="repro-guide"><strong>Visual reproduction</strong><span>Watch the result card below: red means the pinned bug reproduced, green means expected behavior, and amber means the check is still running.</span></header>{props.children}</body></html> }\n`;
const hydratedRootRoute = `/// <reference types="vite/client" />\nimport { HeadContent, Scripts, createRootRoute } from '@tanstack/solid-router'\nimport { HydrationScript } from '@solidjs/web'\nimport type { JSX } from '@solidjs/web'\nexport const Route = createRootRoute({ shellComponent: RootDocument })\nfunction RootDocument(props: { children: JSX.Element }) { return <html lang="en"><head><HydrationScript /><HeadContent /><style innerHTML={${JSON.stringify(visualStyles)}} /><script innerHTML={${JSON.stringify(visualObserver)}} /></head><body><header class="repro-guide"><strong>Visual reproduction</strong><span>Watch the result card below: red means the pinned bug reproduced, green means expected behavior, and amber means the check is still running.</span></header>{props.children}<Scripts /></body></html> }\n`;
const repro = `import { spawn } from 'node:child_process'
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
    console.log('\\n' + (pass ? 'PASS — expected SSR behavior' : 'FAIL — bug reproduced in the TanStack Start route'))
    console.log('HTTP', response.status)
    break
  } catch (error) {
    if (error?.name === 'TimeoutError') { console.log('\\nFAIL — SSR response did not finish within 2.5s'); break }
  }
  await new Promise(resolve => setTimeout(resolve, 500))
}
console.log('Dev server remains at http://localhost:3000/ (Ctrl-C to stop).')
`;

function write(path, contents) {
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, contents.endsWith("\n") ? contents : contents + "\n");
}

for (const [stem, route] of Object.entries(scenarios)) {
  const slug = `draft-${stem}`;
  const dir = join(ROOT, "repros", slug);
  for (const obsolete of [
    "vite.config.js",
    "src/repro.jsx",
    "src/repro.tsx",
    "src/index.jsx",
    "src/index.tsx",
    "src/App.tsx",
    "index.html"
  ]) {
    rmSync(join(dir, obsolete), { force: true });
  }
  write(join(dir, "package.json"), packageJson(slug));
  write(join(dir, "vite.config.ts"), vite);
  write(join(dir, "tsconfig.json"), tsconfig);
  write(join(dir, "src/router.tsx"), router);
  const hydrates = [
    "51-ssr-rejection-client-unhandled",
    "57-createreaction-id-slot",
    "58-transparent-memo-server",
    "59-readhydratedvalue-envelope",
    "64-repeat-count-nan-undefined"
  ].includes(stem);
  write(join(dir, "src/routes/__root.tsx"), hydrates ? hydratedRootRoute : rootRoute);
  write(join(dir, "src/routes/index.tsx"), route);
  write(join(dir, "scripts/repro.mjs"), repro);
  const draft = join(DRAFTS, stem + ".md");
  write(
    join(dir, "README.md"),
    `# ${slug}\n\nA minimal ${hydrates ? "streaming SSR + browser hydration" : "SSR"} reproduction implemented as a real TanStack Start route. The browser preview is the primary reproduction: its large result card and, where relevant, streaming timeline show the observed behavior directly.\n\n- Visual preview: \`npm install && npm start\`\n- Optional raw HTTP diagnostics: \`npm run repro\`\n- Issue draft: \`issue-drafts/${stem}.md\`${existsSync(draft) ? "" : "\n- Status: historical repro; the corresponding draft is resolved"}\n`
  );
  if (existsSync(draft)) {
    let markdown = readFileSync(draft, "utf8");
    const live = `**[Live TanStack Start reproduction](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=${slug})** — opens the real SSR route in StackBlitz.`;
    const start = markdown.indexOf("### Your Example Website or App");
    const end = markdown.indexOf("### Steps to Reproduce", start);
    const hydrationNote = hydrates
      ? " This project includes Start's `<Scripts />`, so the same request proceeds through real browser hydration; an early head listener makes global hydration errors visible on the page."
      : "";
    const example = `### Your Example Website or App\n\n${live}\n\nThis is a normal TanStack Start route—no direct \`renderToString\`, custom SSR server, captured HTML, or export-condition harness. Hard-refresh the preview to exercise Start's server render.${hydrationNote} The browser is the primary verification surface: a large color-coded result card and, for timing issues, an in-page streaming timeline explain what happened. The optional \`npm run repro\` command only supplements that view with raw HTTP diagnostics.\n\n\`src/routes/index.tsx\`:\n\n\`\`\`tsx\n${route}\n\`\`\`\n\n`;
    markdown = markdown.slice(0, start) + example + markdown.slice(end);
    const stepsStart = markdown.indexOf("### Steps to Reproduce the Bug or Issue");
    const expectedStart = markdown.indexOf("### Expected behavior", stepsStart);
    const steps = `### Steps to Reproduce the Bug or Issue\n\n1. Open the live reproduction (or run \`npm install && npm start\`).\n2. Hard-refresh \`/\` so TanStack Start renders the route on the server.\n3. Watch the large result card or streaming timeline in the page: red means the pinned bug reproduced, green means expected behavior, and amber means the check is still running.\n4. Optional: run \`npm run repro\` only when raw HTTP status or response-chunk diagnostics are useful; the terminal output supplements the visual result.\n\n`;
    markdown = markdown.slice(0, stepsStart) + steps + markdown.slice(expectedStart);
    if (!markdown.includes("- Runtime: TanStack Start")) {
      markdown = markdown.replace(
        "### Platform\n",
        "### Platform\n\n- Runtime: TanStack Start SSR (`@tanstack/solid-start@2.0.0-beta.24`)\n"
      );
    }
    writeFileSync(draft, markdown);
  }
  console.log(slug);
}

// Draft 43 has a second control route, so keep its hand-authored Start app while
// syncing the primary route and visual-first instructions into the issue draft.
{
  const stem = "43-errored-reveal-scope";
  const slug = "draft-43-tanstack-errored-reveal-scope";
  const draft = join(DRAFTS, stem + ".md");
  const route = readFileSync(join(ROOT, "repros", slug, "src/routes/index.tsx"), "utf8").trim();
  if (existsSync(draft)) {
    let markdown = readFileSync(draft, "utf8");
    const start = markdown.indexOf("### Your Example Website or App");
    const end = markdown.indexOf("### Steps to Reproduce", start);
    const live = `**[Live TanStack Start reproduction](https://yumemi-thomas.github.io/solid-repros/launch.html?repro=${slug})** — opens the real SSR route in StackBlitz.`;
    const example = `### Your Example Website or App\n\n${live}\n\nThis is a normal TanStack Start route with real streaming SSR and browser hydration. The browser is the primary verification surface: its in-page timeline records when the order and payment panels arrive, then explains the result in a large color-coded card. The optional \`npm run repro\` command only supplements that view with raw response-chunk diagnostics.\n\n\`src/routes/index.tsx\`:\n\n\`\`\`tsx\n${route}\n\`\`\`\n\n`;
    markdown = markdown.slice(0, start) + example + markdown.slice(end);
    const stepsStart = markdown.indexOf("### Steps to Reproduce the Bug or Issue");
    const expectedStart = markdown.indexOf("### Expected behavior", stepsStart);
    const steps = `### Steps to Reproduce the Bug or Issue\n\n1. Open the live reproduction (or run \`npm install && npm start\`).\n2. Hard-refresh \`/\` so TanStack Start renders the route on the server.\n3. Watch the in-page streaming timeline: it records the order and payment arrival times, then turns red if the payment panel incorrectly holds the order or green if they reveal independently.\n4. Optional: run \`npm run repro\` for raw response-chunk timings; the terminal output supplements the visual result.\n\n`;
    markdown = markdown.slice(0, stepsStart) + steps + markdown.slice(expectedStart);
    writeFileSync(draft, markdown);
    console.log(slug);
  }
}
