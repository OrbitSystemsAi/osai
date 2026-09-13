import type { Metadata } from 'next'
import { connection } from 'next/server'
import SophiaValidationPage from '../../src/passkeys/SophiaValidationPage'

export const metadata: Metadata = { title: 'Validate your request | Orbit Systems AI', robots: { index: false, follow: false } }

export default async function Page() {
  await connection()
  return <SophiaValidationPage />
}
