# draft-64 — client `<Repeat count={NaN}>` crashes; `count={undefined}` renders nothing

SSR/client asymmetry (Solid **2.0.0-beta.17**). `<Repeat>` empty-detection is
truthiness on the server (`if (!len)` → `undefined`/`NaN`/`0` all show the
fallback) but a strict `newLen === 0` on the client. So on the client
`count={NaN}` falls into `new Array(NaN)` and throws `RangeError: Invalid array
length` during render (SSR shipped fine fallback HTML for the same tree), and
`count={undefined}` renders nothing at all. The control `count={0}` renders the
fallback fine. The NaN client crash is the plain bug; the `undefined` fallback
semantics is a design question, but both runtimes must agree.

Run: `npm run dev` and open the preview — the verdict renders on the page.

Issue draft: `issue-drafts/64-repeat-count-nan-undefined.md`
