import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'

export const runtime = 'nodejs'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATUSES = ['new', 'contacted', 'qualified', 'closed']

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
      SELECT id, display_name, company_name, email, phone, website_url, status, notes, created_at, updated_at
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
      companyName?: string
      email?: string
      phone?: string
      websiteUrl?: string
      status?: string
      notes?: string
    }
    const displayName = body.displayName?.trim() || ''
    const companyName = body.companyName?.trim() || ''
    const email = body.email?.trim().toLowerCase() || ''
    const phone = body.phone?.trim() || ''
    const websiteUrl = body.websiteUrl?.trim() || ''
    const status = body.status?.trim() || ''
    const notes = body.notes?.trim() || ''
    if (!displayName || displayName.length > 120 || companyName.length > 160 || email.length > 254 || phone.length > 40 || websiteUrl.length > 2048 || notes.length > 2000 || !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'INVALID_PROSPECT' }, { status: 400 })
    }
    if (email && !EMAIL_PATTERN.test(email)) return NextResponse.json({ error: 'Enter a valid email address or leave the email blank.' }, { status: 400 })
    if (!validWebsiteUrl(websiteUrl)) return NextResponse.json({ error: 'Enter a complete website URL beginning with http:// or https://.' }, { status: 400 })
    const sql = db()
    const rows = await sql`
      UPDATE prospects SET display_name = ${displayName}, company_name = ${companyName}, email = ${email},
        phone = ${phone}, website_url = ${websiteUrl}, status = ${status}, notes = ${notes}, updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING id, display_name, company_name, email, phone, website_url, status, notes, created_at, updated_at
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
