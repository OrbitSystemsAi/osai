import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'
const statuses = ['draft', 'published', 'archived']
const levels = ['public', 'member', 'general_nda', 'project_nda', 'beta', 'internal']

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const rows = await db()`SELECT id, name, slug, description, status, access_level, updated_at FROM projects ORDER BY updated_at DESC`
    return NextResponse.json({ projects: rows })
  } catch (error) {
    const result = apiError(error, 'PROJECTS_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json() as Record<string, string>
    if (!body.name?.trim() || !body.slug?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !statuses.includes(body.status) || !levels.includes(body.accessLevel)) return NextResponse.json({ error: 'INVALID_PROJECT' }, { status: 400 })
    const sql = db()
    const rows = await sql`INSERT INTO projects (name, slug, description, status, access_level, created_by, updated_by) VALUES (${body.name.trim()}, ${body.slug}, ${body.description?.trim() || ''}, ${body.status}, ${body.accessLevel}, ${actor.authUserId}, ${actor.authUserId}) RETURNING id, name, slug, description, status, access_level, updated_at`
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.created', 'project', ${String(rows[0].id)})`
    return NextResponse.json({ project: rows[0] }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'PROJECT_CREATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
