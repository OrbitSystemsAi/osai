import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const sql = db()
    const prospects = await sql`
      SELECT id, display_name, company_name, email, phone, status, notes, created_at, updated_at
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
      companyName?: string
      email?: string
      phone?: string
      notes?: string
    }
    const displayName = body.displayName?.trim() || ''
    const companyName = body.companyName?.trim() || ''
    const email = body.email?.trim().toLowerCase() || ''
    const phone = body.phone?.trim() || ''
    const notes = body.notes?.trim() || ''

    if (!displayName || displayName.length > 120) {
      return NextResponse.json({ error: 'Enter a prospect name of 120 characters or fewer.' }, { status: 400 })
    }
    if (companyName.length > 160 || email.length > 254 || phone.length > 40 || notes.length > 2000) {
      return NextResponse.json({ error: 'One or more prospect fields exceed the allowed length.' }, { status: 400 })
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address or leave the email blank.' }, { status: 400 })
    }

    const sql = db()
    const rows = await sql`
      INSERT INTO prospects (display_name, company_name, email, phone, notes, created_by)
      VALUES (${displayName}, ${companyName}, ${email}, ${phone}, ${notes}, ${actor.authUserId})
      RETURNING id, display_name, company_name, email, phone, status, notes, created_at, updated_at
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
