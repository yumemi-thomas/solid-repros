# draft-60 — `$df` fragment swap stops at the first comment instead of the matching `<!--pl-X-->`

*(dom-expressions issue — `@dom-expressions/runtime@0.50.0-next.17`, `REPLACE_SCRIPT`;
consumed by `solid-js@2.0.0-beta.17` streaming SSR.)*

This is a real browser + HTTP streaming reproduction. A small Node/Vite SSR
server renders an export-report card with `renderToStream`; the browser receives
the fallback first, receives the resolved fragment 1.2 seconds later, executes
Solid's emitted `$df` activation script, and then hydrates the same `<App>`.

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

Open the StackBlitz **preview** and watch the status line. The page reports the
DOM both after the real stream completes and after hydration.

- Expected: `"Download ready"` → PASS
- On beta.17: `"Download ready42% complete"` → FAIL

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/60-df-comment-scan-debris.md`.
