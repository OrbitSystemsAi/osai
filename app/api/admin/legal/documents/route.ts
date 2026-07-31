import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'

export const runtime = 'nodejs'

const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const form = await request.formData()
    const file = form.get('document')
    const projectGroupId = String(form.get('projectGroupId') || '')
    const confirmedProjectGroupId = String(form.get('confirmedProjectGroupId') || '')
    if (!(file instanceof File) || !uuidPattern.test(projectGroupId) || projectGroupId !== confirmedProjectGroupId) {
      return NextResponse.json({ error: 'PROJECT_GROUP_CONFIRMATION_REQUIRED' }, { status: 400 })
    }
    if (!allowedTypes.has(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'INVALID_LEGAL_DOCUMENT' }, { status: 400 })
    }
    const sql = db()
    const group = await sql`SELECT id, title FROM legal_project_groups WHERE id = ${projectGroupId}::uuid`
    if (!group.length) return NextResponse.json({ error: 'PROJECT_GROUP_NOT_FOUND' }, { status: 404 })
    const bytes = Buffer.from(await file.arrayBuffer())
    const rows = await sql`
      INSERT INTO legal_documents (project_group_id, file_name, mime_type, file_size, file_data, uploaded_by)
      VALUES (${projectGroupId}::uuid, ${file.name.slice(0, 255)}, ${file.type}, ${file.size}, ${bytes}, ${actor.authUserId})
      RETURNING id, project_group_id, file_name, document_type, mime_type, file_size, created_at`
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${actor.authUserId}, 'legal_document.uploaded', 'legal_document', ${String(rows[0].id)},
        ${JSON.stringify({ projectGroupId, projectGroupTitle: String(group[0].title), fileName: file.name })}::jsonb)`
    return NextResponse.json({ document: rows[0] }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'LEGAL_DOCUMENT_UPLOAD_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
