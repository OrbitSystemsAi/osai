import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'

export const runtime = 'nodejs'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATUSES = ['new', 'contacted', 'qualified', 'closed', 'discovery', 'qualification', 'solution', 'proposal', 'negotiation', 'won', 'lost']

function validWebsiteUrl(value: string) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    const rows = await db()`
      SELECT id, display_name, contact_title, company_name, email, business_email, phone, business_phone,
        website_url, status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_at, updated_at
      FROM prospects
      WHERE id = ${id}::uuid
    `
    if (!rows.length) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ prospect: rows[0] })
  } catch (error) {
    const result = apiError(error, 'PROSPECT_DETAIL_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    const body = await request.json() as {
      displayName?: string
      contactTitle?: string
      companyName?: string
      email?: string
      businessEmail?: string
      phone?: string
      businessPhone?: string
      websiteUrl?: string
      status?: string
      problemStatement?: string
      desiredOutcomes?: string
      proposedSolution?: string
      ideas?: string
      decisionProcess?: string
      budgetRange?: string
      targetTimeline?: string
      nextStep?: string
      notes?: string
    }
    const displayName = body.displayName?.trim() || ''
    const contactTitle = body.contactTitle?.trim() || ''
    const companyName = body.companyName?.trim() || ''
    const email = body.email?.trim().toLowerCase() || ''
    const businessEmail = body.businessEmail?.trim().toLowerCase() || ''
    const phone = body.phone?.trim() || ''
    const businessPhone = body.businessPhone?.trim() || ''
    const websiteUrl = body.websiteUrl?.trim() || ''
    const status = body.status?.trim() || ''
    const problemStatement = body.problemStatement?.trim() || ''
    const desiredOutcomes = body.desiredOutcomes?.trim() || ''
    const proposedSolution = body.proposedSolution?.trim() || ''
    const ideas = body.ideas?.trim() || ''
    const decisionProcess = body.decisionProcess?.trim() || ''
    const budgetRange = body.budgetRange?.trim() || ''
    const targetTimeline = body.targetTimeline?.trim() || ''
    const nextStep = body.nextStep?.trim() || ''
    const notes = body.notes?.trim() || ''
    const discoveryFields = [problemStatement, desiredOutcomes, proposedSolution, ideas, decisionProcess, nextStep, notes]
    if (!displayName || displayName.length > 120 || contactTitle.length > 120 || companyName.length > 160 || email.length > 254 || businessEmail.length > 254 || phone.length > 40 || businessPhone.length > 40 || websiteUrl.length > 2048 || budgetRange.length > 120 || targetTimeline.length > 120 || discoveryFields.some(value => value.length > 4000) || !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'INVALID_PROSPECT' }, { status: 400 })
    }
    if (email && !EMAIL_PATTERN.test(email)) return NextResponse.json({ error: 'Enter a valid email address or leave the email blank.' }, { status: 400 })
    if (businessEmail && !EMAIL_PATTERN.test(businessEmail)) return NextResponse.json({ error: 'Enter a valid business email address or leave it blank.' }, { status: 400 })
    if (!validWebsiteUrl(websiteUrl)) return NextResponse.json({ error: 'Enter a complete website URL beginning with http:// or https://.' }, { status: 400 })
    const sql = db()
    const rows = await sql`
      UPDATE prospects SET display_name = ${displayName}, contact_title = ${contactTitle}, company_name = ${companyName},
        email = ${email}, business_email = ${businessEmail}, phone = ${phone}, business_phone = ${businessPhone},
        website_url = ${websiteUrl}, status = ${status}, problem_statement = ${problemStatement},
        desired_outcomes = ${desiredOutcomes}, proposed_solution = ${proposedSolution}, ideas = ${ideas},
        decision_process = ${decisionProcess}, budget_range = ${budgetRange}, target_timeline = ${targetTimeline},
        next_step = ${nextStep}, notes = ${notes}, updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING id, display_name, contact_title, company_name, email, business_email, phone, business_phone,
        website_url, status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_at, updated_at
    `
    if (!rows.length) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${actor.authUserId}, 'prospect.updated', 'prospect', ${id}, '{}'::jsonb)
    `
    return NextResponse.json({ prospect: rows[0] })
  } catch (error) {
    const result = apiError(error, 'PROSPECT_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
