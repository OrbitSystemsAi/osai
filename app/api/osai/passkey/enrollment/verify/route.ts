import { NextResponse } from 'next/server'
import { administratorSophiaRequest, assertTrustedOrigin, noStoreHeaders, passkeyApiError } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request)
    const body = await request.json() as { registration_transaction?: unknown; credential?: unknown }
    if (typeof body.registration_transaction !== 'string' || !body.registration_transaction || !body.credential || typeof body.credential !== 'object') {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: noStoreHeaders() })
    }
    const response = await administratorSophiaRequest(request, '/api/osai/passkey/enrollment/verify', {
      method: 'POST', body: JSON.stringify({ registration_transaction: body.registration_transaction, credential: body.credential }),
    })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || result.status !== 'registered') return NextResponse.json({ error: 'ENROLLMENT_FAILED' }, { status: response.status >= 500 ? 503 : 400, headers: noStoreHeaders() })
    return NextResponse.json({ status: 'registered' }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}
