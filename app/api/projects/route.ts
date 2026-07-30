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
      : await sql`SELECT id, name, slug, description, image_url, access_level, problem_content FROM projects WHERE status = 'published' AND access_level IN ('public', 'member') ORDER BY updated_at DESC`
    return NextResponse.json({ projects: rows })
  } catch (error) {
    const result = apiError(error, 'PROJECT_CATALOG_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
