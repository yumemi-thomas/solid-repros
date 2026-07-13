# draft-60 — `$df` fragment swap stops at the first comment instead of the matching `<!--pl-X-->`

*(dom-expressions issue — `@dom-expressions/runtime@0.50.0-next.17`, `REPLACE_SCRIPT`;
consumed by `solid-js@2.0.0-beta.17` streaming SSR.)*

Minimal **TanStack Start** reproduction using the same pinned Solid 2 beta
integration as `draft-01`. There is no custom server, client entry, hydration
timer, observer, or analyzer: one route renders one async memo inside one
`<Loading>` boundary.

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
content, and leaves the rest of the fallback in the DOM.

`npm start` (run automatically by StackBlitz) boots the Start dev server. Open
the preview and wait 1.2 seconds. The page presents the comparison directly:

- Expected: `Download ready`
- Actual on beta.17: `Download ready42% complete`

The document keeps Start's `HydrationScript`, which is required by the real
stream protocol, but intentionally omits `<Scripts />`. That is the smallest
way to keep client hydration from repairing the malformed server DOM before it
can be inspected. It models blocked or deferred client JavaScript without a
custom client entry or artificial hydration delay.

A control run with `<Scripts />` restored hydrates early and reaches
`Download ready`; that does not change the malformed intermediate DOM produced
by `$df`, which is the server-stream bug this reproduction isolates.

Pinned to `solid-js@2.0.0-beta.17`, `@solidjs/web@2.0.0-beta.17`,
`@tanstack/solid-start@2.0.0-beta.24`, and `@tanstack/solid-router@2.0.0-beta.23`.
Issue draft: `issue-drafts/60-df-comment-scan-debris.md`.
