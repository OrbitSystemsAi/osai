import type { Metadata } from 'next'
import '../src/styles.css'

export const metadata: Metadata = {
  title: 'OSai | Ideas into market-ready businesses and products',
  description: 'OSai creates ventures, develops client products, and provides expert business and technology consulting.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
