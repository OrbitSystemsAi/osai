import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse, type NextFetchEvent, type NextMiddleware, type NextRequest } from 'next/server'

const passkeyPages = new Set(['/validate', '/admin/passkeys'])
const publicLegalPages = new Set(['/privacy', '/terms'])
let existingSiteAuthentication: NextMiddleware | undefined

function passkeyPageResponse(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const developmentScript = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScript}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://accounts.google.com https://*.googleapis.com",
    "frame-src https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('Content-Security-Policy', contentSecurityPolicy)
  return response
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (passkeyPages.has(request.nextUrl.pathname)) return passkeyPageResponse(request)
  if (publicLegalPages.has(request.nextUrl.pathname)) return NextResponse.next()
  if (request.nextUrl.pathname.startsWith('/api/osai/passkey/')) return NextResponse.next()
  existingSiteAuthentication ??= clerkMiddleware()
  return existingSiteAuthentication(request, event)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
