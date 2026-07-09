# issue-20 — render() dispose wipes pre-existing content

An embeddable widget with a `mount(el)` API (`render(fn, el)` + a disposer — the
shape `@astrojs/solid-js` uses) is mounted into the host's `#reviews` slot, which
already holds a heading + summary the host page rendered.

1. **mount widget** — the island appends after the host's content (append mode).
2. **unmount widget** — the disposer runs `el.textContent = ""` and blanks the
   whole slot, destroying the host's heading + summary too. Status turns red.

Deps are pinned to published `2.0.0-beta.16` (npm); the bug also reproduces on
`2.0.0-beta.15` and 1.x.
