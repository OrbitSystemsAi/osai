import { NextResponse } from 'next/server'
import { apiError, requireAdmin } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'
import { canonicalToolName, generateToolSummary } from '../../../../../src/lib/tools'
import { normalizeWebsiteUrl } from '../../../../../src/lib/prospect-contact'

export const runtime = 'nodejs'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin(request)
    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: 'TOOL_NOT_FOUND' }, { status: 404 })
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
    const duplicate = await sql`SELECT id FROM tools WHERE canonical_name = ${canonicalToolName(name)} AND id <> ${id}::uuid LIMIT 1`
    if (duplicate.length) return NextResponse.json({ error: 'That tool is already in the dictionary.' }, { status: 409 })
    const rows = await sql`
      UPDATE tools
      SET name = ${name}, canonical_name = ${canonicalToolName(name)}, summary = ${summary}, website_url = ${websiteUrl},
        vendor_name = ${vendorName}, category = ${category}, api_status = ${apiStatus}, api_docs_url = ${apiDocsUrl},
        api_auth_method = ${apiAuthMethod}, api_notes = ${apiNotes}, pricing_url = ${pricingUrl},
        support_url = ${supportUrl}, security_notes = ${securityNotes},
        is_osai_stack = ${isOsaiStack}, is_integratable = ${isIntegratable}, updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING id, name, summary, website_url, vendor_name, category, api_status, api_docs_url, api_auth_method,
        api_notes, pricing_url, support_url, security_notes, is_osai_stack, is_integratable, created_at, updated_at
    `
    if (!rows.length) return NextResponse.json({ error: 'TOOL_NOT_FOUND' }, { status: 404 })
    await sql`
      INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
      VALUES (${actor.authUserId}, 'tool.updated', 'tool', ${id}, '{}'::jsonb)
    `
    return NextResponse.json({ tool: rows[0] })
  } catch (error) {
    const result = apiError(error, 'TOOL_UPDATE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
