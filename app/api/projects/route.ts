import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../src/server/authorization'
import { db } from '../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request)
    const sql = db()
    const rows = profile.role === 'admin'
      ? await sql`SELECT project.id, project.name, project.slug, project.description, project.image_url, project.access_level, project.milestones, project.industry, project.category, project.sub_category, industry_record.image_url AS industry_image_url, industry_record.brief_description AS industry_brief_description, industry_record.long_description AS industry_long_description, 'project_access_approved'::text AS membership_status FROM projects project LEFT JOIN project_industries industry_record ON lower(industry_record.name) = lower(project.industry) WHERE project.status <> 'archived' ORDER BY project.updated_at DESC`
      : await sql`
          SELECT project.id, project.name, project.slug, project.description,
            project.image_url, project.access_level, project.milestones,
            project.industry, project.category, project.sub_category,
            industry_record.image_url AS industry_image_url,
            industry_record.brief_description AS industry_brief_description,
            industry_record.long_description AS industry_long_description,
            membership.status AS membership_status
          FROM projects project
          LEFT JOIN project_memberships membership
            ON membership.project_id = project.id
            AND membership.auth_user_id = ${profile.authUserId}
          LEFT JOIN project_industries industry_record
            ON lower(industry_record.name) = lower(project.industry)
          WHERE project.status <> 'archived'
          ORDER BY project.updated_at DESC`
    return NextResponse.json({ projects: rows })
  } catch (error) {
    const result = apiError(error, 'PROJECT_CATALOG_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
