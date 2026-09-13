'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/validate' || pathname === '/admin/passkeys' || pathname === '/privacy' || pathname === '/terms') return children
  return <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">{children}</ClerkProvider>
}
