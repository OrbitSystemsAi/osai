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
  // Preserve authorization relationships for accounts that existed before the
  // Clerk migration. Email is used only once to reconcile the new identity;
  // all subsequent authorization continues to use the stored immutable ID.
  const existing = await sql`
    SELECT auth_user_id, email, display_name, role
    FROM user_profiles
    WHERE auth_user_id = ${member.id} OR lower(email) = lower(${member.email})
    ORDER BY CASE WHEN auth_user_id = ${member.id} THEN 0 ELSE 1 END
    LIMIT 1
  `
  if (existing[0]) {
    const profile = existing[0]
    const promoted = bootstrapAdmin && profile.role !== 'admin'
    if (member.hasExplicitName || promoted) await sql`
      UPDATE user_profiles SET
        display_name = CASE WHEN ${member.hasExplicitName} THEN ${member.name} ELSE display_name END,
        role = CASE WHEN ${bootstrapAdmin} THEN 'admin' ELSE role END,
        updated_at = now()
      WHERE auth_user_id = ${String(profile.auth_user_id)}
    `
    return {
      authUserId: String(profile.auth_user_id), email: member.email,
      displayName: member.hasExplicitName ? member.name : String(profile.display_name),
      role: (promoted ? 'admin' : profile.role) as AppRole,
    }
  }
  const rows = await sql`
    INSERT INTO user_profiles (auth_user_id, email, display_name, role)
    VALUES (${member.id}, ${member.email}, ${member.name}, ${bootstrapAdmin ? 'admin' : 'member'})
    ON CONFLICT (auth_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = CASE WHEN ${member.hasExplicitName} THEN EXCLUDED.display_name ELSE user_profiles.display_name END,
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
