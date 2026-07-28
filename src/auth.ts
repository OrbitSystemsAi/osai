import { createAuthClient } from '@neondatabase/neon-js/auth'
import { SupabaseAuthAdapter } from '@neondatabase/neon-js'

const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL?.trim()

export const isAuthConfigured = Boolean(authUrl)

export const authClient = authUrl
  ? createAuthClient(authUrl, { adapter: SupabaseAuthAdapter() })
  : null
