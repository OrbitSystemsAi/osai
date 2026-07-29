import { NextRequest, NextResponse } from 'next/server'
import { docusignConfigured, envelopeStatus, openEnvelope, requireMember } from '../../../src/server/docusign'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const environment = process.env.DOCUSIGN_API_BASE_URL?.includes('demo.docusign.net') ? 'demo' : 'production'
  if (!docusignConfigured()) return NextResponse.json({ configured: false, environment, status: 'general_nda_pending' })
  try {
    const member = await requireMember(request)
    const envelopeId = openEnvelope(member.id, request.cookies.get('osai_docusign_envelope')?.value)
    if (!envelopeId) return NextResponse.json({ configured: true, environment, status: 'general_nda_pending' })
    const envelope = await envelopeStatus(envelopeId)
    const status = envelope.status === 'completed' ? 'general_nda_signed' : envelope.status === 'voided' ? 'general_nda_expired' : 'general_nda_sent'
    return NextResponse.json({ configured: true, environment, status, completedAt: envelope.completedAt })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AGREEMENT_STATUS_FAILED'
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHENTICATED' ? 401 : 502 })
  }
}
