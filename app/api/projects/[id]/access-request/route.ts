import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'
import { sendProjectAccessRequestEmail } from '../../../../../src/server/email'

export const runtime = 'nodejs'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ACTIVE_ACCESS = new Set(['project_agreement_signed', 'project_access_approved'])
const PENDING_ACCESS = new Set(['project_access_requested', 'project_review_pending', 'project_information_required', 'project_agreement_pending'])

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile(request)
    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    const sql = db()
    const rows = await sql`
      SELECT project.id, project.name, project.slug, membership.status AS membership_status
      FROM projects project
      LEFT JOIN project_memberships membership
        ON membership.project_id = project.id
        AND membership.auth_user_id = ${profile.authUserId}
      WHERE project.id = ${id}::uuid AND project.status <> 'archived'`
    if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })

    const project = rows[0]
    const currentStatus = project.membership_status ? String(project.membership_status) : ''
    if (ACTIVE_ACCESS.has(currentStatus)) return NextResponse.json({ status: currentStatus, emailDelivery: 'not_required' })
    if (PENDING_ACCESS.has(currentStatus)) return NextResponse.json({ status: currentStatus, emailDelivery: 'already_requested' })

    await sql`
      INSERT INTO project_memberships (project_id, auth_user_id, project_role, status)
      VALUES (${id}::uuid, ${profile.authUserId}, 'participant', 'project_access_requested')
      ON CONFLICT (project_id, auth_user_id) DO UPDATE SET
        status = 'project_access_requested', updated_at = now()`
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${profile.authUserId}, 'project.access_requested', 'project', ${id}, ${JSON.stringify({ memberEmail: profile.email })}::jsonb)`

    const admins = await sql`SELECT email FROM user_profiles WHERE role = 'admin' AND status = 'approved' ORDER BY email`
    const appUrl = process.env.OSAI_APP_URL?.trim() || new URL(request.url).origin
    const emailDelivery = await sendProjectAccessRequestEmail({
      adminEmails: admins.map(admin => String(admin.email)),
      memberName: profile.displayName,
      memberEmail: profile.email,
      projectId: id,
      projectName: String(project.name),
      projectUrl: `${appUrl}/member/admin-users`,
    })
    if (emailDelivery !== 'sent') {
      await sql`
        INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
        VALUES (${profile.authUserId}, 'project.access_request_email_unavailable', 'project', ${id}, ${JSON.stringify({ emailDelivery })}::jsonb)`
    }
    return NextResponse.json({ status: 'project_access_requested', emailDelivery }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'PROJECT_ACCESS_REQUEST_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
