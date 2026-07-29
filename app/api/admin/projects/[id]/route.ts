import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'

export const runtime = 'nodejs'
const statuses = ['draft', 'published', 'archived']
const levels = ['public', 'member', 'general_nda', 'project_nda', 'beta', 'internal']

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    const body = await request.json() as Record<string, string>
    if (!body.name?.trim() || !body.slug?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !statuses.includes(body.status) || !levels.includes(body.accessLevel)) return NextResponse.json({ error: 'INVALID_PROJECT' }, { status: 400 })
    const sql = db()
    const rows = await sql`UPDATE projects SET name=${body.name.trim()}, slug=${body.slug}, description=${body.description?.trim() || ''}, status=${body.status}, access_level=${body.accessLevel}, updated_by=${actor.authUserId}, updated_at=now() WHERE id=${id}::uuid RETURNING id, name, slug, description, status, access_level, updated_at`
    if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.updated', 'project', ${id})`
    return NextResponse.json({ project: rows[0] })
  } catch (error) {
    const result = apiError(error, 'PROJECT_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    const sql = db()
    const rows = await sql`DELETE FROM projects WHERE id=${id}::uuid RETURNING id`
    if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.deleted', 'project', ${id})`
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const result = apiError(error, 'PROJECT_DELETE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
