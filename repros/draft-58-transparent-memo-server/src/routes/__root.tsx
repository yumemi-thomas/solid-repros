/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from '@tanstack/solid-router'
import { HydrationScript } from '@solidjs/web'
import type { JSX } from '@solidjs/web'
export const Route = createRootRoute({ shellComponent: RootDocument })
function RootDocument(props: { children: JSX.Element }) { return <html lang="en"><head><HydrationScript /><script innerHTML={"window.__reproEvents=[];const note=e=>{const value=e.reason||e.error||e.message;window.__reproEvents.push(String(value&&value.message||value));const target=document.getElementById('browser-verdict');if(target){target.dataset.result='fail';target.textContent='FAIL — browser error: '+window.__reproEvents.join(' | ')}};addEventListener('unhandledrejection',note);addEventListener('error',note)"} /></head><body><HeadContent />{props.children}<Scripts /></body></html> }
