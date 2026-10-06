import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validWebsiteUrl(value: string) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const sql = db()
    const prospects = await sql`
      SELECT id, display_name, contact_title, company_name, email, business_email, phone, business_phone,
        website_url, status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_at, updated_at
      FROM prospects
      ORDER BY created_at DESC
    `
    return NextResponse.json({ prospects })
  } catch (error) {
    const result = apiError(error, 'PROSPECTS_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json() as {
      displayName?: string
      contactTitle?: string
      companyName?: string
      email?: string
      businessEmail?: string
      phone?: string
      businessPhone?: string
      websiteUrl?: string
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
    const problemStatement = body.problemStatement?.trim() || ''
    const desiredOutcomes = body.desiredOutcomes?.trim() || ''
    const proposedSolution = body.proposedSolution?.trim() || ''
    const ideas = body.ideas?.trim() || ''
    const decisionProcess = body.decisionProcess?.trim() || ''
    const budgetRange = body.budgetRange?.trim() || ''
    const targetTimeline = body.targetTimeline?.trim() || ''
    const nextStep = body.nextStep?.trim() || ''
    const notes = body.notes?.trim() || ''

    if (!displayName || displayName.length > 120) {
      return NextResponse.json({ error: 'Enter a prospect name of 120 characters or fewer.' }, { status: 400 })
    }
    const discoveryFields = [problemStatement, desiredOutcomes, proposedSolution, ideas, decisionProcess, nextStep, notes]
    if (contactTitle.length > 120 || companyName.length > 160 || email.length > 254 || businessEmail.length > 254 || phone.length > 40 || businessPhone.length > 40 || websiteUrl.length > 2048 || budgetRange.length > 120 || targetTimeline.length > 120 || discoveryFields.some(value => value.length > 4000)) {
      return NextResponse.json({ error: 'One or more prospect fields exceed the allowed length.' }, { status: 400 })
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address or leave the email blank.' }, { status: 400 })
    }
    if (businessEmail && !EMAIL_PATTERN.test(businessEmail)) {
      return NextResponse.json({ error: 'Enter a valid business email address or leave it blank.' }, { status: 400 })
    }
    if (!validWebsiteUrl(websiteUrl)) {
      return NextResponse.json({ error: 'Enter a complete website URL beginning with http:// or https://.' }, { status: 400 })
    }

    const sql = db()
    const rows = await sql`
      INSERT INTO prospects (
        display_name, contact_title, company_name, email, business_email, phone, business_phone,
        website_url, status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_by
      ) VALUES (
        ${displayName}, ${contactTitle}, ${companyName}, ${email}, ${businessEmail}, ${phone}, ${businessPhone},
        ${websiteUrl}, 'discovery', ${problemStatement}, ${desiredOutcomes}, ${proposedSolution}, ${ideas},
        ${decisionProcess}, ${budgetRange}, ${targetTimeline}, ${nextStep}, ${notes}, ${actor.authUserId}
      )
      RETURNING id, display_name, contact_title, company_name, email, business_email, phone, business_phone,
        website_url, status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_at, updated_at
    `
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${actor.authUserId}, 'prospect.created', 'prospect', ${String(rows[0].id)}, '{}'::jsonb)
    `
    return NextResponse.json({ prospect: rows[0] }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'PROSPECT_CREATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
