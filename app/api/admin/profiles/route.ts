import { NextResponse } from 'next/server'
import { apiError, requireAdmin, type AppRole } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'
import { clerkClient } from '@clerk/nextjs/server'

export const runtime = 'nodejs'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const sql = db()
    const [rows, projects] = await Promise.all([sql`
      SELECT profile.auth_user_id, profile.email, profile.display_name, profile.role,
        profile.status, profile.updated_at,
        CASE
          WHEN profile.role = 'admin' THEN 'Administrator'
          WHEN profile.status = 'approved' AND agreement.completed_at IS NULL THEN 'Site Member'
          WHEN profile.status = 'approved' THEN 'Pending Approval'
          WHEN profile.status = 'pending_approval' THEN 'Pending Membership'
          ELSE 'Member'
        END AS membership_role,
        CASE
          WHEN profile.role = 'admin' THEN 'Approved'
          WHEN profile.status = 'approved' AND agreement.completed_at IS NULL THEN 'Pending MNDA'
          WHEN profile.status = 'approved' THEN 'Pending Approval'
          ELSE initcap(replace(profile.status, '_', ' '))
        END AS membership_status,
        count(project.id)::int AS project_count,
        coalesce(jsonb_agg(jsonb_build_object(
          'id', project.id, 'name', project.name, 'role', membership.project_role, 'status', membership.status,
          'legalDocuments', coalesce((
            SELECT jsonb_agg(jsonb_build_object(
              'id', document.id,
              'fileName', document.file_name,
              'documentType', document.document_type
            ) ORDER BY document.created_at DESC)
            FROM legal_project_groups legal_group
            JOIN legal_documents document ON document.project_group_id = legal_group.id
            WHERE legal_group.project_id = project.id
          ), '[]'::jsonb)
        ) ORDER BY project.name) FILTER (WHERE project.id IS NOT NULL), '[]'::jsonb) AS projects
      FROM user_profiles profile
      LEFT JOIN LATERAL (
        SELECT completed_at
        FROM agreement_envelopes
        WHERE auth_user_id = profile.auth_user_id
          AND agreement_type = 'general_mnda'
          AND environment = 'production'
          AND status = 'completed'
        ORDER BY completed_at DESC
        LIMIT 1
      ) agreement ON true
      LEFT JOIN project_memberships membership ON membership.auth_user_id = profile.auth_user_id
      LEFT JOIN projects project ON project.id = membership.project_id AND project.status <> 'archived'
      GROUP BY profile.auth_user_id, agreement.completed_at
      ORDER BY profile.display_name, profile.email
    `, sql`
      SELECT id, name
      FROM projects
      WHERE status <> 'archived'
      ORDER BY name
    `])
    return NextResponse.json({ profiles: rows, projects })
  } catch (error) {
    const result = apiError(error, 'PROFILES_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json() as { authUserId?: string; role?: AppRole; projectIds?: string[] }
    if (!body.authUserId) return NextResponse.json({ error: 'INVALID_PROFILE_UPDATE' }, { status: 400 })
    const sql = db()
    if (body.role !== undefined) {
      if (!['member', 'admin'].includes(body.role)) return NextResponse.json({ error: 'INVALID_ROLE_UPDATE' }, { status: 400 })
      if (body.authUserId === actor.authUserId && body.role !== 'admin') return NextResponse.json({ error: 'CANNOT_REMOVE_OWN_ADMIN_ROLE' }, { status: 409 })
      const rows = await sql`UPDATE user_profiles SET role = ${body.role}, updated_at = now() WHERE auth_user_id = ${body.authUserId} RETURNING auth_user_id, email, display_name, role, updated_at`
      if (!rows.length) return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 })
      await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata) VALUES (${actor.authUserId}, 'profile.role_changed', 'user_profile', ${body.authUserId}, ${JSON.stringify({ role: body.role })}::jsonb)`
      return NextResponse.json({ profile: rows[0] })
    }

    if (!Array.isArray(body.projectIds)) return NextResponse.json({ error: 'INVALID_PROJECT_ASSIGNMENT' }, { status: 400 })
    const projectIds = [...new Set(body.projectIds)]
    if (projectIds.some(projectId => !UUID_PATTERN.test(projectId))) return NextResponse.json({ error: 'INVALID_PROJECT_ASSIGNMENT' }, { status: 400 })
    const profile = await sql`SELECT auth_user_id FROM user_profiles WHERE auth_user_id = ${body.authUserId}`
    if (!profile.length) return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 })
    const available = await sql`
      SELECT id::text AS id
      FROM projects
      WHERE status <> 'archived'
        AND id IN (SELECT value::uuid FROM jsonb_array_elements_text(${JSON.stringify(projectIds)}::jsonb))
    `
    if (available.length !== projectIds.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    await sql`
      WITH selected AS (
        SELECT value::uuid AS project_id
        FROM jsonb_array_elements_text(${JSON.stringify(projectIds)}::jsonb)
      ), removed AS (
        DELETE FROM project_memberships
        WHERE auth_user_id = ${body.authUserId}
          AND status IN ('project_agreement_signed', 'project_access_approved')
          AND project_id NOT IN (SELECT project_id FROM selected)
      )
      INSERT INTO project_memberships (project_id, auth_user_id, project_role, status)
      SELECT project_id, ${body.authUserId}, 'participant', 'project_access_approved'
      FROM selected
      ON CONFLICT (project_id, auth_user_id) DO UPDATE
      SET status = 'project_access_approved', updated_at = now()
    `
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata) VALUES (${actor.authUserId}, 'profile.projects_assigned', 'user_profile', ${body.authUserId}, ${JSON.stringify({ projectIds })}::jsonb)`
    return NextResponse.json({ authUserId: body.authUserId, projectIds })
  } catch (error) {
    const result = apiError(error, 'PROFILE_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json() as { authUserId?: string }
    if (!body.authUserId) return NextResponse.json({ error: 'INVALID_PROFILE_DELETE' }, { status: 400 })
    if (body.authUserId === actor.authUserId) return NextResponse.json({ error: 'CANNOT_DELETE_OWN_ACCOUNT' }, { status: 409 })

    const sql = db()
    const profiles = await sql`
      SELECT auth_user_id, role
      FROM user_profiles
      WHERE auth_user_id = ${body.authUserId}
    `
    if (!profiles.length) return NextResponse.json({ error: 'PROFILE_NOT_FOUND' }, { status: 404 })
    if (profiles[0].role === 'admin') return NextResponse.json({ error: 'CANNOT_DELETE_ADMIN_ACCOUNT' }, { status: 409 })

    const dependencies = await sql`
      SELECT
        (SELECT count(*)::int FROM projects WHERE created_by = ${body.authUserId} OR updated_by = ${body.authUserId}) AS projects,
        (SELECT count(*)::int FROM legal_project_groups WHERE created_by = ${body.authUserId} OR updated_by = ${body.authUserId}) AS legal_groups,
        (SELECT count(*)::int FROM legal_documents WHERE uploaded_by = ${body.authUserId}) AS legal_documents
    `
    const dependency = dependencies[0]
    if (Number(dependency.projects) || Number(dependency.legal_groups) || Number(dependency.legal_documents)) {
      return NextResponse.json({
        error: 'PROFILE_HAS_OWNED_RECORDS',
        dependencies: {
          projects: Number(dependency.projects),
          legalGroups: Number(dependency.legal_groups),
          legalDocuments: Number(dependency.legal_documents),
        },
      }, { status: 409 })
    }

    await sql.transaction(transaction => [
      transaction`DELETE FROM user_profiles WHERE auth_user_id = ${body.authUserId}`,
      transaction`
        INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
        VALUES (${actor.authUserId}, 'profile.deleted', 'user_profile', ${body.authUserId}, ${JSON.stringify({ formerRole: profiles[0].role })}::jsonb)
      `,
    ])
    const client = await clerkClient()
    const users = await client.users.getUserList({ externalId: [body.authUserId], limit: 1 })
    if (users.data[0]) {
      await client.users.deleteUser(users.data[0].id)
    } else {
      try {
        await client.users.deleteUser(body.authUserId)
      } catch {
        // A reconciled legacy profile can exist before its replacement Clerk
        // identity is created. In that case there is no Clerk record to remove.
      }
    }
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const result = apiError(error, 'PROFILE_DELETE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
