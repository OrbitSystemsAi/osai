import { NextResponse } from 'next/server'
import { administratorSophiaRequest, assertTrustedOrigin, noStoreHeaders, passkeyApiError } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request)
    const body = await request.json() as { credential?: unknown; label?: unknown }
    if (!body.credential || typeof body.credential !== 'object') return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: noStoreHeaders() })
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 80) : ''
    if (!label) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: noStoreHeaders() })
    const response = await administratorSophiaRequest(request, '/api/osai/passkey/enrollment/verify', {
      method: 'POST', body: JSON.stringify({ credential: body.credential, label }),
    })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || result.status !== 'registered') return NextResponse.json({ error: 'ENROLLMENT_FAILED' }, { status: response.status >= 500 ? 503 : 400, headers: noStoreHeaders() })
    return NextResponse.json({ status: 'registered' }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}
