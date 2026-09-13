import { NextResponse } from 'next/server'
import { assertTrustedOrigin, noStoreHeaders, passkeyApiError, publicSophiaRequest, safeValidationStatus } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request)
    const body = await request.json() as { validation_transaction?: unknown; credential?: unknown }
    if (typeof body.validation_transaction !== 'string' || !body.validation_transaction || !body.credential || typeof body.credential !== 'object') {
      return NextResponse.json({ status: 'failed' }, { status: 400, headers: noStoreHeaders() })
    }
    const response = await publicSophiaRequest('/api/osai/passkey/validation/verify', {
      validation_transaction: body.validation_transaction,
      credential: body.credential,
    })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    const status = safeValidationStatus(result.status, response.status >= 500 ? 'unavailable' : 'failed')
    if (!response.ok || status !== 'validated') {
      return NextResponse.json({ status }, { status: response.status >= 500 ? 503 : response.status, headers: noStoreHeaders() })
    }
    return NextResponse.json({ status: 'validated' }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ status: failure.code === 'INVALID_ORIGIN' ? 'failed' : 'unavailable' }, { status: failure.status, headers: noStoreHeaders() })
  }
}
