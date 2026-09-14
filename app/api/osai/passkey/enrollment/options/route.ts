import { NextResponse } from 'next/server'
import { administratorSophiaRequest, assertTrustedOrigin, noStoreHeaders, passkeyApiError } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request)
    const body = await request.json() as { label?: unknown }
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 80) : ''
    if (!label) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: noStoreHeaders() })
    const response = await administratorSophiaRequest(request, '/api/osai/passkey/enrollment/options', {
      method: 'POST', body: JSON.stringify({ label }),
    })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || typeof result.registration_transaction !== 'string' || !result.registration_transaction || !result.public_key_options || typeof result.public_key_options !== 'object') {
      return NextResponse.json({ error: 'ENROLLMENT_UNAVAILABLE' }, { status: response.status >= 500 ? 503 : 400, headers: noStoreHeaders() })
    }
    return NextResponse.json({
      registration_transaction: result.registration_transaction,
      public_key_options: result.public_key_options,
    }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}
