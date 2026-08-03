import { NextRequest, NextResponse } from 'next/server'
import { createSigningView, docusignConfigured, requireMember, sealEnvelope } from '../../../../src/server/docusign'
import { db } from '../../../../src/server/database'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!docusignConfigured()) return NextResponse.json({ error: 'DOCUSIGN_NOT_CONFIGURED' }, { status: 503 })
  try {
    const member = await requireMember(request)
    const result = await createSigningView(member, `${request.nextUrl.origin}/member/legal?docusign=returned`)
    const environment = process.env.DOCUSIGN_API_BASE_URL?.includes('demo.docusign.net') ? 'demo' : 'production'
    const sql = db()
    await sql`
      INSERT INTO agreement_envelopes (
        auth_user_id, agreement_type, agreement_version, provider, provider_envelope_id, environment, status
      ) VALUES (${member.id}, 'general_mnda', '1.0', 'docusign', ${result.envelopeId}, ${environment}, 'sent')
      ON CONFLICT (provider_envelope_id) DO UPDATE SET status = 'sent', updated_at = now()
    `
    const response = NextResponse.json({ url: result.url })
    response.cookies.set('osai_docusign_envelope', sealEnvelope(member.id, result.envelopeId), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
    })
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DOCUSIGN_START_FAILED'
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHENTICATED' ? 401 : 502 })
  }
}
