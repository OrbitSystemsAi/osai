import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../src/styles.css'

export const metadata: Metadata = {
  title: 'OSai | Ideas into market-ready businesses and products',
  description: 'OSai creates ventures, develops client products, and provides expert business and technology consulting.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/invitation"><html lang="en"><body>{children}</body></html></ClerkProvider>
}
