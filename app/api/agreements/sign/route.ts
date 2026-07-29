import { NextRequest, NextResponse } from 'next/server'
import { createSigningView, docusignConfigured, requireMember, sealEnvelope } from '../../../../src/server/docusign'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!docusignConfigured()) return NextResponse.json({ error: 'DOCUSIGN_NOT_CONFIGURED' }, { status: 503 })
  try {
    const member = await requireMember(request)
    const result = await createSigningView(member, `${request.nextUrl.origin}/member/agreements?docusign=returned`)
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
