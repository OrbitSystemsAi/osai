import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'

export const runtime = 'nodejs'
const statuses = ['draft', 'published', 'archived']
const levels = ['public', 'member', 'general_nda', 'project_nda', 'beta', 'internal']
const milestoneStatuses = ['planned', 'in_progress', 'completed']
const taskStatuses = ['to_do', 'in_progress', 'completed']
const projectTitleMax = 80
const projectDescriptionMax = 350

type DashboardBody = {
  imageUrl?: string
  userGoal?: number
  costBudget?: number
  costActual?: number
  adoptionRate?: number
  forecastPenetration?: number
  milestones?: Array<{ id: string; name: string; date: string; status: string }>
  tasks?: Array<{ id: string; name: string; description: string; status: string; dueDate: string }>
  problemContent?: Array<{ id: string; rowId?: string; type: string; text?: string; imageUrl?: string; caption?: string; alt?: string }>
  solutionContent?: Array<{ id: string; rowId?: string; type: string; text?: string; imageUrl?: string; caption?: string; alt?: string }>
  competitionContent?: Array<{ id: string; rowId?: string; type: string; text?: string; imageUrl?: string; caption?: string; alt?: string }>
  marketContent?: Array<{ id: string; rowId?: string; type: string; text?: string; imageUrl?: string; caption?: string; alt?: string }>
  businessModelContent?: Array<{ id: string; rowId?: string; type: string; text?: string; imageUrl?: string; caption?: string; alt?: string }>
}

function validDashboard(body: DashboardBody) {
  const numbers = [body.userGoal, body.costBudget, body.costActual, body.adoptionRate, body.forecastPenetration]
  if (numbers.some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0)) return false
  if ((body.adoptionRate ?? 0) > 100 || (body.forecastPenetration ?? 0) > 100) return false
  if (!Array.isArray(body.milestones) || !Array.isArray(body.tasks)) return false
  if (!Array.isArray(body.problemContent) || !Array.isArray(body.solutionContent) || !Array.isArray(body.competitionContent) || !Array.isArray(body.marketContent) || !Array.isArray(body.businessModelContent)) return false
  if (body.milestones.some(item => !item.id || !item.name?.trim() || !milestoneStatuses.includes(item.status))) return false
  if (body.tasks.some(item => !item.id || !item.name?.trim() || !taskStatuses.includes(item.status))) return false
  if (body.problemContent.length > 100 || body.problemContent.some(item => !item.id || (item.rowId?.length || 0) > 120 || !['heading','paragraph','image','quote','list','statistic'].includes(item.type) || (item.text?.length || 0) > 5000 || (item.caption?.length || 0) > 240 || (item.alt?.length || 0) > 160 || (item.imageUrl?.length || 0) > 2_800_000)) return false
  if (body.solutionContent.length > 100 || body.solutionContent.some(item => !item.id || (item.rowId?.length || 0) > 120 || !['heading','paragraph','image','quote','list','statistic'].includes(item.type) || (item.text?.length || 0) > 5000 || (item.caption?.length || 0) > 240 || (item.alt?.length || 0) > 160 || (item.imageUrl?.length || 0) > 2_800_000)) return false
  if ([body.competitionContent, body.marketContent, body.businessModelContent].some(content => content.length > 100 || content.some(item => !item.id || (item.rowId?.length || 0) > 120 || !['heading','paragraph','image','quote','list','statistic'].includes(item.type) || (item.text?.length || 0) > 5000 || (item.caption?.length || 0) > 240 || (item.alt?.length || 0) > 160 || (item.imageUrl?.length || 0) > 2_800_000))) return false
  return true
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await context.params
    const rows = await db()`
      SELECT p.id, p.name, p.slug, p.description, p.status, p.access_level, p.image_url,
        p.user_goal, p.cost_budget, p.cost_actual, p.adoption_rate, p.forecast_penetration,
        p.milestones, p.tasks, p.problem_content, p.solution_content, p.competition_content,
        p.market_content, p.business_model_content, p.created_at, p.updated_at, count(pm.auth_user_id)::int AS user_actual
      FROM projects p
      LEFT JOIN project_memberships pm ON pm.project_id = p.id
      WHERE p.id = ${id}::uuid
      GROUP BY p.id
    `
    if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ project: rows[0] })
  } catch (error) {
    const result = apiError(error, 'PROJECT_DETAIL_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    const body = await request.json() as Record<string, string> & { dashboard?: DashboardBody }
    if (body.dashboard) {
      if (!validDashboard(body.dashboard)) return NextResponse.json({ error: 'INVALID_PROJECT_DASHBOARD' }, { status: 400 })
      const dashboard = body.dashboard
      const milestones = JSON.stringify(dashboard.milestones)
      const tasks = JSON.stringify(dashboard.tasks)
      const problemContent = JSON.stringify(dashboard.problemContent)
      const solutionContent = JSON.stringify(dashboard.solutionContent)
      const competitionContent = JSON.stringify(dashboard.competitionContent)
      const marketContent = JSON.stringify(dashboard.marketContent)
      const businessModelContent = JSON.stringify(dashboard.businessModelContent)
      const sql = db()
      const rows = await sql`
        UPDATE projects SET image_url=${dashboard.imageUrl?.trim() || ''}, user_goal=${dashboard.userGoal || 0},
          cost_budget=${dashboard.costBudget || 0}, cost_actual=${dashboard.costActual || 0},
          adoption_rate=${dashboard.adoptionRate || 0}, forecast_penetration=${dashboard.forecastPenetration || 0},
          milestones=${milestones}::jsonb, tasks=${tasks}::jsonb, problem_content=${problemContent}::jsonb,
          solution_content=${solutionContent}::jsonb,
          competition_content=${competitionContent}::jsonb, market_content=${marketContent}::jsonb,
          business_model_content=${businessModelContent}::jsonb,
          updated_by=${actor.authUserId}, updated_at=now()
        WHERE id=${id}::uuid RETURNING id
      `
      if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
      await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.dashboard_updated', 'project', ${id})`
      return NextResponse.json({ project: rows[0] })
    }
    if (!body.name?.trim() || body.name.trim().length > projectTitleMax || (body.description?.trim().length || 0) > projectDescriptionMax || !body.slug?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !statuses.includes(body.status) || !levels.includes(body.accessLevel)) return NextResponse.json({ error: 'INVALID_PROJECT' }, { status: 400 })
    const sql = db()
    const rows = await sql`
      WITH updated_project AS (
        UPDATE projects SET name=${body.name.trim()}, slug=${body.slug}, description=${body.description?.trim() || ''}, status=${body.status}, access_level=${body.accessLevel}, updated_by=${actor.authUserId}, updated_at=now()
        WHERE id=${id}::uuid
        RETURNING id, name, slug, description, status, access_level, created_by, updated_by, updated_at
      ), synced_group AS (
        INSERT INTO legal_project_groups (project_id, title, created_by, updated_by)
        SELECT id, name, created_by, updated_by FROM updated_project
        ON CONFLICT (project_id) DO UPDATE SET title=EXCLUDED.title, updated_by=EXCLUDED.updated_by, updated_at=now()
        RETURNING id
      )
      SELECT id, name, slug, description, status, access_level, updated_at FROM updated_project`
    if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.updated', 'project', ${id})`
    return NextResponse.json({ project: rows[0] })
  } catch (error) {
    const result = apiError(error, 'PROJECT_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    const sql = db()
    const rows = await sql`DELETE FROM projects WHERE id=${id}::uuid RETURNING id`
    if (!rows.length) return NextResponse.json({ error: 'PROJECT_NOT_FOUND' }, { status: 404 })
    await sql`INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id) VALUES (${actor.authUserId}, 'project.deleted', 'project', ${id})`
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const result = apiError(error, 'PROJECT_DELETE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
