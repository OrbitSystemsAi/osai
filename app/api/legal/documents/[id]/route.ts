import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'

export const runtime = 'nodejs'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request)
    const { id } = await context.params
    if (!uuidPattern.test(id)) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 })
    const sql = db()
    if (profile.role !== 'admin') {
      const environment = process.env.DOCUSIGN_API_BASE_URL?.includes('demo.docusign.net') ? 'demo' : 'production'
      const generalAgreement = await sql`
        SELECT 1
        FROM agreement_envelopes
        WHERE auth_user_id = ${profile.authUserId}
          AND agreement_type = 'general_mnda'
          AND environment = ${environment}
          AND status = 'completed'
        LIMIT 1`
      if (!generalAgreement.length) return NextResponse.json({ error: 'GENERAL_MNDA_REQUIRED' }, { status: 403 })
    }
    const rows = profile.role === 'admin'
      ? await sql`
          SELECT ld.file_name, ld.mime_type, ld.file_data
          FROM legal_documents ld
          WHERE ld.id = ${id}::uuid`
      : await sql`
          SELECT ld.file_name, ld.mime_type, ld.file_data
          FROM legal_documents ld
          JOIN legal_project_groups lpg ON lpg.id = ld.project_group_id
          JOIN projects p ON p.id = lpg.project_id
          JOIN project_memberships pm ON pm.project_id = p.id
            AND pm.auth_user_id = ${profile.authUserId}
            AND pm.status IN (
              'project_access_requested',
              'project_review_pending',
              'project_information_required',
              'project_agreement_pending',
              'project_agreement_signed',
              'project_access_approved'
            )
          WHERE ld.id = ${id}::uuid AND p.status <> 'archived'`
    if (!rows.length) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 })
    const fileName = String(rows[0].file_name).replace(/[\r\n"]/g, '_')
    return new NextResponse(rows[0].file_data as BodyInit, {
      headers: {
        'Content-Type': String(rows[0].mime_type),
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    const result = apiError(error, 'LEGAL_DOCUMENT_DOWNLOAD_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
