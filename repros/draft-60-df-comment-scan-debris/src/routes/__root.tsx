/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from '@tanstack/solid-router'
import { HydrationScript } from '@solidjs/web'
import type { JSX } from '@solidjs/web'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start × Solid 2 — streamed fallback debris repro' },
    ],
    links: [
      { rel: 'stylesheet', href: '/repro.css' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        {props.children}
        <script src="/observe-stream.js" />
        <Scripts />
      </body>
    </html>
  )
}
