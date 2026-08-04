import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json() as {
      type?: 'category' | 'subcategory'
      currentName?: string
      name?: string
      imageUrl?: string
      briefDescription?: string
      longDescription?: string
    }
    const type = body.type
    const name = body.name?.trim() || ''
    const currentName = body.currentName?.trim() || name
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : null
    const briefDescription = typeof body.briefDescription === 'string' ? body.briefDescription.trim() : null
    const longDescription = typeof body.longDescription === 'string' ? body.longDescription.trim() : null
    if (!type || !['category', 'subcategory'].includes(type) || !name || name.length > 80 || (imageUrl?.length || 0) > 2_800_000 || (briefDescription?.length || 0) > 300 || (longDescription?.length || 0) > 10000) {
      return NextResponse.json({ error: 'INVALID_CLASSIFICATION' }, { status: 400 })
    }
    const sql = db()
    const [classification] = await sql`
      INSERT INTO project_classification_pages (classification_type, name, image_url, brief_description, long_description, updated_at)
      VALUES (${type}, ${name}, ${imageUrl || ''}, ${briefDescription || ''}, ${longDescription || ''}, now())
      ON CONFLICT (classification_type, normalized_name)
      DO UPDATE SET
        name = EXCLUDED.name,
        image_url = COALESCE(${imageUrl}::text, project_classification_pages.image_url),
        brief_description = COALESCE(${briefDescription}::text, project_classification_pages.brief_description),
        long_description = COALESCE(${longDescription}::text, project_classification_pages.long_description),
        updated_at = now()
      RETURNING classification_type, name, image_url, brief_description, long_description`
    if (currentName.toLowerCase() !== name.toLowerCase()) {
      if (type === 'category') {
        await sql`UPDATE projects SET category = ${name}, updated_at = now() WHERE lower(trim(category)) = lower(trim(${currentName}))`
      } else {
        await sql`UPDATE projects SET sub_category = ${name}, updated_at = now() WHERE lower(trim(sub_category)) = lower(trim(${currentName}))`
      }
      await sql`DELETE FROM project_classification_pages WHERE classification_type = ${type} AND lower(trim(name)) = lower(trim(${currentName})) AND lower(trim(name)) <> lower(trim(${name}))`
    }
    return NextResponse.json({ classification })
  } catch (error) {
    const result = apiError(error, 'CLASSIFICATION_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
