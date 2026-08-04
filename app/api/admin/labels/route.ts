import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const sql = db()
    const [industries, classifications] = await Promise.all([
      sql`SELECT name FROM project_industries ORDER BY lower(name)`,
      sql`SELECT classification_type, name, parent_name FROM project_classification_pages ORDER BY classification_type, lower(name)`,
    ])
    return NextResponse.json({ industries, classifications })
  } catch (error) {
    const result = apiError(error, 'LABELS_LOAD_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json() as { type?: 'industry' | 'category' | 'subcategory'; name?: string; parentName?: string }
    const type = body.type
    const name = body.name?.trim() || ''
    const parentName = body.parentName?.trim() || ''
    if (!type || !['industry', 'category', 'subcategory'].includes(type) || !name || name.length > 80 || parentName.length > 80 || (type !== 'industry' && !parentName)) {
      return NextResponse.json({ error: 'INVALID_LABEL' }, { status: 400 })
    }
    const sql = db()
    if (type === 'industry') {
      const [industry] = await sql`
        INSERT INTO project_industries (name, updated_at)
        VALUES (${name}, now())
        ON CONFLICT (normalized_name) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
        RETURNING name`
      return NextResponse.json({ label: { type, ...industry, parent_name: '' } })
    }
    const parentType = type === 'category' ? 'industry' : 'category'
    const [parent] = type === 'category'
      ? await sql`SELECT name FROM project_industries WHERE lower(trim(name)) = lower(trim(${parentName})) LIMIT 1`
      : await sql`SELECT name FROM project_classification_pages WHERE classification_type = 'category' AND lower(trim(name)) = lower(trim(${parentName})) LIMIT 1`
    if (!parent) return NextResponse.json({ error: `INVALID_${parentType.toUpperCase()}` }, { status: 400 })
    const [classification] = await sql`
      INSERT INTO project_classification_pages (classification_type, name, parent_name, updated_at)
      VALUES (${type}, ${name}, ${parentName}, now())
      ON CONFLICT (classification_type, normalized_name)
      DO UPDATE SET name = EXCLUDED.name, parent_name = EXCLUDED.parent_name, updated_at = now()
      RETURNING classification_type, name, parent_name`
    return NextResponse.json({ label: { type: classification.classification_type, name: classification.name, parent_name: classification.parent_name } })
  } catch (error) {
    const result = apiError(error, 'LABEL_CREATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json() as { type?: 'industry' | 'category' | 'subcategory'; name?: string }
    const name = body.name?.trim() || ''
    if (!body.type || !['industry', 'category', 'subcategory'].includes(body.type) || !name) return NextResponse.json({ error: 'INVALID_LABEL' }, { status: 400 })
    const sql = db()
    if (body.type === 'industry') {
      const [usage] = await sql`
        SELECT
          (SELECT count(*)::int FROM projects WHERE lower(trim(industry)) = lower(trim(${name}))) AS project_count,
          (SELECT count(*)::int FROM project_classification_pages WHERE classification_type = 'category' AND lower(trim(parent_name)) = lower(trim(${name}))) AS child_count`
      if ((usage?.project_count || 0) > 0 || (usage?.child_count || 0) > 0) return NextResponse.json({ error: 'INDUSTRY_IN_USE' }, { status: 409 })
      await sql`DELETE FROM project_industries WHERE lower(trim(name)) = lower(trim(${name}))`
    } else if (body.type === 'category') {
      const [usage] = await sql`
        SELECT
          (SELECT count(*)::int FROM projects WHERE lower(trim(category)) = lower(trim(${name}))) AS project_count,
          (SELECT count(*)::int FROM project_classification_pages WHERE classification_type = 'subcategory' AND lower(trim(parent_name)) = lower(trim(${name}))) AS child_count`
      if ((usage?.project_count || 0) > 0 || (usage?.child_count || 0) > 0) return NextResponse.json({ error: 'CATEGORY_IN_USE' }, { status: 409 })
      await sql`DELETE FROM project_classification_pages WHERE classification_type = 'category' AND lower(trim(name)) = lower(trim(${name}))`
    } else {
      const [usage] = await sql`SELECT count(*)::int AS project_count FROM projects WHERE lower(trim(sub_category)) = lower(trim(${name}))`
      if ((usage?.project_count || 0) > 0) return NextResponse.json({ error: 'SUBCATEGORY_IN_USE' }, { status: 409 })
      await sql`DELETE FROM project_classification_pages WHERE classification_type = 'subcategory' AND lower(trim(name)) = lower(trim(${name}))`
    }
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const result = apiError(error, 'LABEL_DELETE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
