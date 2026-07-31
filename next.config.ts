import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return [{ source: '/member/agreements', destination: '/member/legal', permanent: true }]
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
