import { createAuthClient } from '@neondatabase/neon-js/auth'
import { SupabaseAuthAdapter } from '@neondatabase/neon-js'

// The Neon Auth base URL is a public client endpoint, not a secret. Keep the
// environment override for preview/production branches and use the OSai main
// branch as the reliable local/default connection.
const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL?.trim()
  || 'https://ep-plain-flower-ayy9vych.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth'

export const authClient = createAuthClient(authUrl, { adapter: SupabaseAuthAdapter() })
