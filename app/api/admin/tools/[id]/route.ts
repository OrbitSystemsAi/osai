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
    const body = await request.json() as { name?: string; summary?: string; websiteUrl?: string; isOsaiStack?: boolean; isIntegratable?: boolean }
    const name = body.name?.trim().replace(/\s+/g, ' ') || ''
    const websiteUrl = normalizeWebsiteUrl(body.websiteUrl || '')
    const isOsaiStack = body.isOsaiStack === true
    const isIntegratable = body.isIntegratable === true
    const summary = body.summary?.trim() || generateToolSummary(name, isOsaiStack, isIntegratable)
    if (!name || name.length > 120 || summary.length > 1000 || websiteUrl === null) {
      return NextResponse.json({ error: 'Enter a valid tool name, summary, and optional website.' }, { status: 400 })
    }
    const sql = db()
    const rows = await sql`
      UPDATE tools
      SET name = ${name}, canonical_name = ${canonicalToolName(name)}, summary = ${summary}, website_url = ${websiteUrl},
        is_osai_stack = ${isOsaiStack}, is_integratable = ${isIntegratable}, updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING id, name, summary, website_url, is_osai_stack, is_integratable, created_at, updated_at
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
