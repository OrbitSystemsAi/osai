import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'
const statuses = ['draft', 'published', 'archived']
const levels = ['public', 'member', 'general_nda', 'project_nda', 'beta', 'internal']
const projectTitleMax = 80
const projectDescriptionMax = 350

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
    if (!body.name?.trim() || body.name.trim().length > projectTitleMax || (body.description?.trim().length || 0) > projectDescriptionMax || !body.slug?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !statuses.includes(body.status) || !levels.includes(body.accessLevel)) return NextResponse.json({ error: 'INVALID_PROJECT' }, { status: 400 })
    const sql = db()
    const rows = await sql`
      WITH created_project AS (
        INSERT INTO projects (name, slug, description, status, access_level, created_by, updated_by)
        VALUES (${body.name.trim()}, ${body.slug}, ${body.description?.trim() || ''}, ${body.status}, ${body.accessLevel}, ${actor.authUserId}, ${actor.authUserId})
        RETURNING id, name, slug, description, status, access_level, created_by, updated_by, updated_at
      ), created_group AS (
        INSERT INTO legal_project_groups (project_id, title, created_by, updated_by)
        SELECT id, name, created_by, updated_by FROM created_project
        RETURNING id
      )
      SELECT id, name, slug, description, status, access_level, updated_at FROM created_project`
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.created', 'project', ${String(rows[0].id)})`
    return NextResponse.json({ project: rows[0] }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'PROJECT_CREATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
