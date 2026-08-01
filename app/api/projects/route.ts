import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../src/server/authorization'
import { db } from '../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request)
    const sql = db()
    const rows = profile.role === 'admin'
      ? await sql`SELECT id, name, slug, description, image_url, access_level, milestones, 'project_access_approved'::text AS membership_status FROM projects WHERE status <> 'archived' ORDER BY updated_at DESC`
      : await sql`
          SELECT project.id, project.name, project.slug, project.description,
            project.image_url, project.access_level, project.milestones,
            membership.status AS membership_status
          FROM projects project
          LEFT JOIN project_memberships membership
            ON membership.project_id = project.id
            AND membership.auth_user_id = ${profile.authUserId}
          WHERE project.status <> 'archived'
          ORDER BY project.updated_at DESC`
    return NextResponse.json({ projects: rows })
  } catch (error) {
    const result = apiError(error, 'PROJECT_CATALOG_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
