import { NextRequest, NextResponse } from 'next/server'
import { docusignConfigured, envelopeStatus, openEnvelope, requireMember } from '../../../src/server/docusign'
import { db } from '../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const environment = process.env.DOCUSIGN_API_BASE_URL?.includes('demo.docusign.net') ? 'demo' : 'production'
  if (!docusignConfigured()) return NextResponse.json({ configured: false, environment, status: 'general_nda_pending' })
  try {
    const member = await requireMember(request)
    const sql = db()
    const cookieEnvelopeId = openEnvelope(member.id, request.cookies.get('osai_docusign_envelope')?.value)
    const savedEnvelopes = cookieEnvelopeId ? [] : await sql`
      SELECT provider_envelope_id
      FROM agreement_envelopes
      WHERE auth_user_id = ${member.id} AND agreement_type = 'general_mnda' AND environment = ${environment}
      ORDER BY updated_at DESC
      LIMIT 1
    `
    const envelopeId = cookieEnvelopeId || (savedEnvelopes[0]?.provider_envelope_id ? String(savedEnvelopes[0].provider_envelope_id) : null)
    if (!envelopeId) return NextResponse.json({ configured: true, environment, status: 'general_nda_pending' })
    const envelope = await envelopeStatus(envelopeId)
    const status = envelope.status === 'completed' ? 'general_nda_signed' : envelope.status === 'voided' ? 'general_nda_expired' : 'general_nda_sent'
    await sql`
      UPDATE agreement_envelopes
      SET status = ${envelope.status === 'completed' ? 'completed' : envelope.status === 'voided' ? 'voided' : 'sent'},
          completed_at = ${envelope.completedAt},
          updated_at = now()
      WHERE provider_envelope_id = ${envelopeId} AND auth_user_id = ${member.id}
    `
    return NextResponse.json({ configured: true, environment, status, completedAt: envelope.completedAt })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AGREEMENT_STATUS_FAILED'
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHENTICATED' ? 401 : 502 })
  }
}
