import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json() as { currentName?: string; name?: string; imageUrl?: string; briefDescription?: string; longDescription?: string }
    const name = body.name?.trim() || ''
    const currentName = body.currentName?.trim() || name
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : null
    const briefDescription = typeof body.briefDescription === 'string' ? body.briefDescription.trim() : null
    const longDescription = typeof body.longDescription === 'string' ? body.longDescription.trim() : null
    if (!name || name.length > 80 || (imageUrl?.length || 0) > 2_800_000 || (briefDescription?.length || 0) > 300 || (longDescription?.length || 0) > 10000) {
      return NextResponse.json({ error: 'INVALID_INDUSTRY' }, { status: 400 })
    }
    const sql = db()
    const [industry] = await sql`
      INSERT INTO project_industries (name, image_url, brief_description, long_description, updated_at)
      VALUES (${name}, ${imageUrl || ''}, ${briefDescription || ''}, ${longDescription || ''}, now())
      ON CONFLICT (normalized_name)
      DO UPDATE SET
        name = EXCLUDED.name,
        image_url = COALESCE(${imageUrl}::text, project_industries.image_url),
        brief_description = COALESCE(${briefDescription}::text, project_industries.brief_description),
        long_description = COALESCE(${longDescription}::text, project_industries.long_description),
        updated_at = now()
      RETURNING name, image_url, brief_description, long_description`
    if (currentName.toLowerCase() !== name.toLowerCase()) {
      await sql`UPDATE projects SET industry = ${name}, updated_at = now() WHERE lower(trim(industry)) = lower(trim(${currentName}))`
      await sql`DELETE FROM project_industries WHERE lower(trim(name)) = lower(trim(${currentName})) AND lower(trim(name)) <> lower(trim(${name}))`
    }
    return NextResponse.json({ industry })
  } catch (error) {
    const result = apiError(error, 'INDUSTRY_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
