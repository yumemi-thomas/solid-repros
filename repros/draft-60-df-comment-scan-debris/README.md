# draft-60 — `$df` fragment swap stops at the first comment instead of the matching `<!--pl-X-->`

*(dom-expressions issue — `@dom-expressions/runtime@0.50.0-next.17`, `REPLACE_SCRIPT`;
consumed by `solid-js@2.0.0-beta.17` streaming SSR.)*

This is a real **TanStack Start** browser + HTTP streaming reproduction, using
the same pinned Solid 2 beta integration as `draft-01`. Start renders an
export-report route; the browser receives the fallback first, receives the
resolved fragment 1.2 seconds later, executes Solid's emitted `$df` activation
script, and hydrates through Start's normal `HydrationScript` + `Scripts` shell.
The conventional `src/client.tsx` entry waits 1.8 seconds before calling
`hydrateStart()`/`hydrate()`, deterministically simulating a deferred or slow
client bundle so the full stream lands before hydration.

The `$df(id)` helper emitted into the stream removes the fallback nodes between
the `pl-X` placeholder and the matching `<!--pl-X-->` end marker, but its
removal loop terminates at the **first comment node of any kind**:

```js
for(;o&&8!==o.nodeType&&o.nodeValue!=="pl-"+e;)t=o.nextSibling,o.remove(),o=t;
```

A realistic inline progress message —
`<Loading fallback={<>Preparing file — {progress()}% complete</>}>` — serializes
with `<!--!$-->` separators between the dynamic text parts. `$df` deletes only
the nodes before the first separator, replaces that separator with the streamed
content, and leaves the rest of the fallback in the DOM forever. The user sees
`Download ready42% complete` glued together.

`npm start` (run automatically by StackBlitz) boots the Start dev server,
streams `/`, and verifies the generated protocol in the terminal. Open the
preview to watch the real DOM swap. A tiny observer loaded before Start's client
bundle records the stream mutation so hydration cannot hide a transient failure.
The analyzer sends a browser user agent because Start intentionally waits for
all-ready output for bots; the preview follows the incremental browser path.

- Expected: `"Download ready"` → PASS
- On beta.17: `"Download ready42% complete"` → FAIL

Pinned to `solid-js@2.0.0-beta.17`, `@solidjs/web@2.0.0-beta.17`,
`@tanstack/solid-start@2.0.0-beta.24`, and `@tanstack/solid-router@2.0.0-beta.23`.
Issue draft: `issue-drafts/60-df-comment-scan-debris.md`.
