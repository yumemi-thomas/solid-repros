# draft-61 — a frozen promise hangs the SSR stream forever

Server bug (Solid **2.0.0-beta.17**). When a server memo returns a promise, the
async settle path memoizes the outcome by **assigning** `.s`/`.v` onto the
**user's promise**. If that promise is frozen (`Object.freeze`, sealed, readonly
proxy) the assignment throws inside the `.then` handler, the internal deferred
that gates the stream never settles, and `renderToStream` **never ends** — the
request hangs and leaks the connection. A plain promise (control) streams fine;
the client never mutates user promises, so it renders fine there.

Run: `npm run repro` (terminal). Each stream races `end()` against a 2s timeout,
so the script always terminates. On beta.17: control ENDED, repro HUNG → FAIL,
with an `unhandledRejection` of `Cannot add property s, object is not extensible`.

Issue draft: `issue-drafts/61-frozen-promise-hung-stream.md`
