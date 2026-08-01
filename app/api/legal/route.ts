import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../src/server/authorization'
import { db } from '../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request)
    const sql = db()
    const groups = profile.role === 'admin'
      ? await sql`
          SELECT lpg.id, lpg.project_id, lpg.title,
            COALESCE(json_agg(json_build_object(
              'id', ld.id,
              'fileName', ld.file_name,
              'documentType', ld.document_type,
              'mimeType', ld.mime_type,
              'fileSize', ld.file_size,
              'createdAt', ld.created_at
            ) ORDER BY ld.created_at DESC) FILTER (WHERE ld.id IS NOT NULL), '[]'::json) AS documents
          FROM legal_project_groups lpg
          JOIN projects p ON p.id = lpg.project_id
          LEFT JOIN legal_documents ld ON ld.project_group_id = lpg.id
          GROUP BY lpg.id, lpg.project_id, lpg.title, p.updated_at
          ORDER BY p.updated_at DESC`
      : await sql`
          SELECT lpg.id, lpg.project_id, lpg.title,
            COALESCE(json_agg(json_build_object(
              'id', ld.id,
              'fileName', ld.file_name,
              'documentType', ld.document_type,
              'mimeType', ld.mime_type,
              'fileSize', ld.file_size,
              'createdAt', ld.created_at
            ) ORDER BY ld.created_at DESC) FILTER (WHERE ld.id IS NOT NULL), '[]'::json) AS documents
          FROM legal_project_groups lpg
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
          LEFT JOIN legal_documents ld ON ld.project_group_id = lpg.id
          WHERE p.status <> 'archived'
          GROUP BY lpg.id, lpg.project_id, lpg.title, p.updated_at
          ORDER BY p.updated_at DESC`
    return NextResponse.json({ groups })
  } catch (error) {
    const result = apiError(error, 'LEGAL_GROUPS_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
