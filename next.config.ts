import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return [{ source: '/member/agreements', destination: '/member/legal', permanent: true }]
  },
  async headers() {
    const passkeyHeaders = [
      { key: 'Cache-Control', value: 'no-store, max-age=0' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
    return [
      { source: '/validate', headers: passkeyHeaders },
      { source: '/admin/passkeys', headers: passkeyHeaders },
      { source: '/api/osai/passkey/:path*', headers: passkeyHeaders },
    ]
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
