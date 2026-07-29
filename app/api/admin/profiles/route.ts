import { NextResponse } from 'next/server'
import { apiError, requireAdmin, type AppRole } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const rows = await db()`
      SELECT profile.auth_user_id, profile.email, profile.display_name, profile.role,
        profile.status, profile.updated_at,
        count(membership.project_id)::int AS project_count,
        coalesce(jsonb_agg(jsonb_build_object(
          'id', project.id, 'name', project.name, 'role', membership.project_role, 'status', membership.status
        ) ORDER BY project.name) FILTER (WHERE project.id IS NOT NULL), '[]'::jsonb) AS projects
      FROM user_profiles profile
      LEFT JOIN project_memberships membership ON membership.auth_user_id = profile.auth_user_id
      LEFT JOIN projects project ON project.id = membership.project_id
      GROUP BY profile.auth_user_id
      ORDER BY profile.display_name, profile.email
    `
    return NextResponse.json({ profiles: rows })
  } catch (error) {
    const result = apiError(error, 'PROFILES_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json() as { authUserId?: string; role?: AppRole }
    if (!body.authUserId || !['member', 'admin'].includes(body.role || '')) return NextResponse.json({ error: 'INVALID_ROLE_UPDATE' }, { status: 400 })
    if (body.authUserId === actor.authUserId && body.role !== 'admin') return NextResponse.json({ error: 'CANNOT_REMOVE_OWN_ADMIN_ROLE' }, { status: 409 })
    const sql = db()
    const rows = await sql`UPDATE user_profiles SET role = ${body.role!}, updated_at = now() WHERE auth_user_id = ${body.authUserId} RETURNING auth_user_id, email, display_name, role, updated_at`
    if (!rows.length) return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 })
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata) VALUES (${actor.authUserId}, 'profile.role_changed', 'user_profile', ${body.authUserId}, ${JSON.stringify({ role: body.role })}::jsonb)`
    return NextResponse.json({ profile: rows[0] })
  } catch (error) {
    const result = apiError(error, 'ROLE_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
