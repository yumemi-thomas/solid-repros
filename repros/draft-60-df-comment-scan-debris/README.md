# draft-60 — `$df` fragment swap stops at the first comment instead of the matching `<!--pl-X-->`

*(dom-expressions issue — `@dom-expressions/runtime@0.50.0-next.17`, `REPLACE_SCRIPT`;
consumed by `solid-js@2.0.0-beta.17` streaming SSR.)*

The `$df(id)` helper emitted into every Solid 2.0 stream removes the fallback
nodes between the `pl-X` placeholder and the matching `<!--pl-X-->` end marker,
but its removal loop terminates at the **first comment node of any kind**:

```js
for(;o&&8!==o.nodeType&&o.nodeValue!=="pl-"+e;)t=o.nextSibling,o.remove(),o=t;
```

A `<Loading fallback={<>Loading {pct()}% done</>}>` serializes with `<!--!$-->`
separators between the dynamic text parts, so `$df` deletes only the nodes
before the first separator, replaces that separator with the streamed content,
and leaves the rest of the fallback in the DOM forever — the user sees
`CONTENT42% done` glued together, permanently in the streamed-before-hydrate
case.

This repro loads the verbatim `renderToStream` markup and runs the verbatim
`$df` from `REPLACE_SCRIPT` exactly as the stream's activation script does.
Open the StackBlitz **preview** — the verdict renders on the page.

- Expected: `textContent === "CONTENT"` → PASS
- On beta.17: `textContent === "CONTENT42% done"` → FAIL

Pinned to published `2.0.0-beta.17` (npm).
Issue draft: `issue-drafts/60-df-comment-scan-debris.md`.
