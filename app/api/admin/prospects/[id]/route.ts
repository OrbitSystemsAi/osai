import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'
import { normalizeProspectContactRecord, normalizeUsPhone, normalizeWebsiteUrl } from '../../../../../src/lib/prospect-contact'
import { parseProspectTools } from '../../../../../src/lib/tools'
import { getProspectTools, syncProspectTools } from '../../../../../src/server/prospect-tools'

export const runtime = 'nodejs'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATUSES = ['new', 'contacted', 'qualified', 'closed', 'discovery', 'qualification', 'solution', 'proposal', 'negotiation', 'won', 'lost']

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    const rows = await db()`
      SELECT id, display_name, contact_title, company_name, email, business_email, phone, business_phone,
        industry, website_url, facebook_url, instagram_url, linkedin_url, x_url, youtube_url, tiktok_url,
        status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_at, updated_at
      FROM prospects
      WHERE id = ${id}::uuid
    `
    if (!rows.length) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    const tools = await getProspectTools(db(), id)
    return NextResponse.json({ prospect: { ...normalizeProspectContactRecord(rows[0] as typeof rows[0] & { phone: string; business_phone: string; website_url: string }), tools } })
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
      industry?: string
      facebookUrl?: string
      instagramUrl?: string
      linkedinUrl?: string
      xUrl?: string
      youtubeUrl?: string
      tiktokUrl?: string
      tools?: unknown
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
    const phone = normalizeUsPhone(body.phone || '')
    const businessPhone = normalizeUsPhone(body.businessPhone || '')
    const websiteUrl = normalizeWebsiteUrl(body.websiteUrl || '')
    const industry = body.industry?.trim() || ''
    const socialUrls = {
      facebookUrl: normalizeWebsiteUrl(body.facebookUrl || ''), instagramUrl: normalizeWebsiteUrl(body.instagramUrl || ''),
      linkedinUrl: normalizeWebsiteUrl(body.linkedinUrl || ''), xUrl: normalizeWebsiteUrl(body.xUrl || ''),
      youtubeUrl: normalizeWebsiteUrl(body.youtubeUrl || ''), tiktokUrl: normalizeWebsiteUrl(body.tiktokUrl || ''),
    }
    const tools = parseProspectTools(body.tools)
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
    if (tools === null) return NextResponse.json({ error: 'Enter up to 50 valid tools with names and notes within the allowed lengths.' }, { status: 400 })
    if (!displayName || displayName.length > 120 || contactTitle.length > 120 || companyName.length > 160 || industry.length > 160 || email.length > 254 || businessEmail.length > 254 || [websiteUrl, ...Object.values(socialUrls)].some(value => (value?.length || 0) > 2048) || budgetRange.length > 120 || targetTimeline.length > 120 || discoveryFields.some(value => value.length > 4000) || !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'INVALID_PROSPECT' }, { status: 400 })
    }
    if (email && !EMAIL_PATTERN.test(email)) return NextResponse.json({ error: 'Enter a valid email address or leave the email blank.' }, { status: 400 })
    if (businessEmail && !EMAIL_PATTERN.test(businessEmail)) return NextResponse.json({ error: 'Enter a valid business email address or leave it blank.' }, { status: 400 })
    if (phone === null || businessPhone === null) return NextResponse.json({ error: 'Enter each phone number with a 10-digit US number or leave it blank.' }, { status: 400 })
    if (websiteUrl === null) return NextResponse.json({ error: 'Enter a valid website such as example.com or www.example.com.' }, { status: 400 })
    if (Object.values(socialUrls).some(value => value === null)) return NextResponse.json({ error: 'Enter valid social profile URLs or leave them blank.' }, { status: 400 })
    const sql = db()
    const rows = await sql`
      UPDATE prospects SET display_name = ${displayName}, contact_title = ${contactTitle}, company_name = ${companyName},
        email = ${email}, business_email = ${businessEmail}, phone = ${phone}, business_phone = ${businessPhone},
        industry = ${industry}, website_url = ${websiteUrl}, facebook_url = ${socialUrls.facebookUrl},
        instagram_url = ${socialUrls.instagramUrl}, linkedin_url = ${socialUrls.linkedinUrl}, x_url = ${socialUrls.xUrl},
        youtube_url = ${socialUrls.youtubeUrl}, tiktok_url = ${socialUrls.tiktokUrl}, status = ${status}, problem_statement = ${problemStatement},
        desired_outcomes = ${desiredOutcomes}, proposed_solution = ${proposedSolution}, ideas = ${ideas},
        decision_process = ${decisionProcess}, budget_range = ${budgetRange}, target_timeline = ${targetTimeline},
        next_step = ${nextStep}, notes = ${notes}, updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING id, display_name, contact_title, company_name, email, business_email, phone, business_phone,
        industry, website_url, facebook_url, instagram_url, linkedin_url, x_url, youtube_url, tiktok_url,
        status, problem_statement, desired_outcomes, proposed_solution, ideas,
        decision_process, budget_range, target_timeline, next_step, notes, created_at, updated_at
    `
    if (!rows.length) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    await syncProspectTools(sql, id, actor.authUserId, tools)
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${actor.authUserId}, 'prospect.updated', 'prospect', ${id}, '{}'::jsonb)
    `
    return NextResponse.json({ prospect: { ...rows[0], tools: await getProspectTools(sql, id) } })
  } catch (error) {
    const result = apiError(error, 'PROSPECT_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    const rows = await db()`
      WITH deleted AS (
        DELETE FROM prospects
        WHERE id = ${id}::uuid
        RETURNING id
      )
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      SELECT ${actor.authUserId}, 'prospect.deleted', 'prospect', id::text, '{}'::jsonb
      FROM deleted
      RETURNING target_id
    `
    if (!rows.length) return NextResponse.json({ error: 'PROSPECT_NOT_FOUND' }, { status: 404 })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const result = apiError(error, 'PROSPECT_DELETE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
