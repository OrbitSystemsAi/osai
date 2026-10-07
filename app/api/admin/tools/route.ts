import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'
import { canonicalToolName, generateToolSummary } from '../../../../src/lib/tools'
import { normalizeWebsiteUrl } from '../../../../src/lib/prospect-contact'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const tools = await db()`
      SELECT tools.id, tools.name, tools.summary, tools.website_url, tools.is_osai_stack, tools.is_integratable,
        tools.vendor_name, tools.category, tools.api_status, tools.api_docs_url, tools.api_auth_method,
        tools.api_notes, tools.pricing_url, tools.support_url, tools.security_notes,
        count(prospect_tools.prospect_id)::int AS prospect_count,
        count(prospect_tools.prospect_id) FILTER (WHERE prospect_tools.active)::int AS active_prospect_count,
        tools.created_at, tools.updated_at
      FROM tools
      LEFT JOIN prospect_tools ON prospect_tools.tool_id = tools.id
      GROUP BY tools.id
      ORDER BY lower(tools.name)
    `
    return NextResponse.json({ tools })
  } catch (error) {
    const result = apiError(error, 'TOOLS_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json() as { name?: string; summary?: string; websiteUrl?: string; vendorName?: string; category?: string; apiStatus?: string; apiDocsUrl?: string; apiAuthMethod?: string; apiNotes?: string; pricingUrl?: string; supportUrl?: string; securityNotes?: string; isOsaiStack?: boolean; isIntegratable?: boolean }
    const name = body.name?.trim().replace(/\s+/g, ' ') || ''
    const websiteUrl = normalizeWebsiteUrl(body.websiteUrl || '')
    const vendorName = body.vendorName?.trim() || ''
    const category = body.category?.trim() || ''
    const apiStatus = body.apiStatus?.trim() || 'unknown'
    const apiDocsUrl = normalizeWebsiteUrl(body.apiDocsUrl || '')
    const apiAuthMethod = body.apiAuthMethod?.trim() || ''
    const apiNotes = body.apiNotes?.trim() || ''
    const pricingUrl = normalizeWebsiteUrl(body.pricingUrl || '')
    const supportUrl = normalizeWebsiteUrl(body.supportUrl || '')
    const securityNotes = body.securityNotes?.trim() || ''
    const isOsaiStack = body.isOsaiStack === true
    const isIntegratable = body.isIntegratable === true
    const summary = body.summary?.trim() || generateToolSummary(name, isOsaiStack, isIntegratable)
    if (!name || name.length > 120 || vendorName.length > 160 || category.length > 120 || summary.length > 1000 || apiAuthMethod.length > 250 || apiNotes.length > 4000 || securityNotes.length > 4000 || !['unknown', 'available', 'limited', 'unavailable'].includes(apiStatus) || [websiteUrl, apiDocsUrl, pricingUrl, supportUrl].some(value => value === null)) {
      return NextResponse.json({ error: 'Enter valid tool details and HTTP(S) URLs.' }, { status: 400 })
    }
    const sql = db()
    const existing = await sql`SELECT id FROM tools WHERE canonical_name = ${canonicalToolName(name)} LIMIT 1`
    if (existing.length) return NextResponse.json({ error: 'That tool is already in the dictionary.' }, { status: 409 })
    const rows = await sql`
      INSERT INTO tools (name, canonical_name, summary, website_url, vendor_name, category, api_status, api_docs_url,
        api_auth_method, api_notes, pricing_url, support_url, security_notes, is_osai_stack, is_integratable, created_by)
      VALUES (${name}, ${canonicalToolName(name)}, ${summary}, ${websiteUrl}, ${vendorName}, ${category}, ${apiStatus}, ${apiDocsUrl},
        ${apiAuthMethod}, ${apiNotes}, ${pricingUrl}, ${supportUrl}, ${securityNotes}, ${isOsaiStack}, ${isIntegratable}, ${actor.authUserId})
      RETURNING id, name, summary, website_url, vendor_name, category, api_status, api_docs_url, api_auth_method,
        api_notes, pricing_url, support_url, security_notes, is_osai_stack, is_integratable, 0::int AS prospect_count,
        0::int AS active_prospect_count, created_at, updated_at
    `
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${actor.authUserId}, 'tool.created', 'tool', ${String(rows[0].id)}, '{}'::jsonb)
    `
    return NextResponse.json({ tool: rows[0] }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'TOOL_CREATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
