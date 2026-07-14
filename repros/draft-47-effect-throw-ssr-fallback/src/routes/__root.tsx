/// <reference types="vite/client" />
import { HeadContent, createRootRoute } from '@tanstack/solid-router'
import { HydrationScript } from '@solidjs/web'
import type { JSX } from '@solidjs/web'
export const Route = createRootRoute({ shellComponent: RootDocument })
function RootDocument(props: { children: JSX.Element }) { return <html lang="en"><head><HydrationScript /></head><body><HeadContent />{props.children}</body></html> }
