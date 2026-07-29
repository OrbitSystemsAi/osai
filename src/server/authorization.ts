import { db } from './database'
import { requireMember } from './docusign'

export type AppRole = 'member' | 'admin'
export type AppProfile = { authUserId: string; email: string; displayName: string; role: AppRole }

function bootstrapAdminIds() {
  return new Set((process.env.OSAI_BOOTSTRAP_ADMIN_USER_IDS || '').split(',').map(value => value.trim()).filter(Boolean))
}

export async function requireProfile(request: Request): Promise<AppProfile> {
  const member = await requireMember(request)
  const sql = db()
  const bootstrapAdmin = bootstrapAdminIds().has(member.id)
  const rows = await sql`
    INSERT INTO user_profiles (auth_user_id, email, display_name, role)
    VALUES (${member.id}, ${member.email}, ${member.name}, ${bootstrapAdmin ? 'admin' : 'member'})
    ON CONFLICT (auth_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      role = CASE WHEN ${bootstrapAdmin} THEN 'admin' ELSE user_profiles.role END,
      updated_at = now()
    RETURNING auth_user_id, email, display_name, role
  `
  const profile = rows[0]
  return { authUserId: String(profile.auth_user_id), email: String(profile.email), displayName: String(profile.display_name), role: profile.role as AppRole }
}

export async function requireAdmin(request: Request) {
  const profile = await requireProfile(request)
  if (profile.role !== 'admin') throw new Error('FORBIDDEN')
  return profile
}

export function apiError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback
  const status = message === 'UNAUTHENTICATED' ? 401 : message === 'FORBIDDEN' ? 403 : message === 'DATABASE_NOT_CONFIGURED' ? 503 : 500
  return { message, status }
}
