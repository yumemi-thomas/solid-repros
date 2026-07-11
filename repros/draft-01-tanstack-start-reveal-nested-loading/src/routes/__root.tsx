/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from '@tanstack/solid-router'
import { HydrationScript } from '@solidjs/web'
import type * as Solid from 'solid-js'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start × Solid 2.0 — Reveal nested Loading repro' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument(props: { children: Solid.JSX.Element }) {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        {props.children}
        <Scripts />
      </body>
    </html>
  )
}
