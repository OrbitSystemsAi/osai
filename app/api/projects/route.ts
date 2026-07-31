import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../src/server/authorization'
import { db } from '../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request)
    const sql = db()
    const rows = profile.role === 'admin'
      ? await sql`SELECT id, name, slug, description, image_url, access_level, problem_content FROM projects WHERE status <> 'archived' ORDER BY updated_at DESC`
      : await sql`
          SELECT project.id, project.name, project.slug, project.description,
            project.image_url, project.access_level, project.problem_content
          FROM projects project
          WHERE project.status <> 'archived'
            AND (
              (project.status = 'published' AND project.access_level IN ('public', 'member'))
              OR EXISTS (
                SELECT 1
                FROM project_memberships membership
                WHERE membership.project_id = project.id
                  AND membership.auth_user_id = ${profile.authUserId}
                  AND membership.status IN ('project_agreement_signed', 'project_access_approved')
              )
            )
          ORDER BY project.updated_at DESC`
    return NextResponse.json({ projects: rows })
  } catch (error) {
    const result = apiError(error, 'PROJECT_CATALOG_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
