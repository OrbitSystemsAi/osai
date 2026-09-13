import type { Metadata } from 'next'
import { connection } from 'next/server'
import SophiaPasskeyAdminPage from '../../../src/passkeys/SophiaPasskeyAdminPage'

export const metadata: Metadata = { title: 'Sophia passkeys | Orbit Systems AI', robots: { index: false, follow: false } }

export default async function Page() {
  await connection()
  return <SophiaPasskeyAdminPage googleClientId={process.env.OSAI_GOOGLE_OAUTH_CLIENT_ID || ''} />
}
