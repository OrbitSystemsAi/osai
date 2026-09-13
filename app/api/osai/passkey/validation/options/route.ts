import { NextResponse } from 'next/server'
import { assertTrustedOrigin, noStoreHeaders, passkeyApiError, publicSophiaRequest, safeValidationStatus } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request)
    const body = await request.json() as { session_code?: unknown }
    const sessionCode = typeof body.session_code === 'string' ? body.session_code.trim() : ''
    if (!/^\d{6}$/.test(sessionCode)) {
      return NextResponse.json({ status: 'invalid' }, { status: 400, headers: noStoreHeaders() })
    }
    const response = await publicSophiaRequest('/api/osai/passkey/validation/options', { session_code: sessionCode })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok) {
      return NextResponse.json(
        { status: safeValidationStatus(result.status, response.status >= 500 ? 'unavailable' : 'invalid') },
        { status: response.status >= 500 ? 503 : response.status, headers: noStoreHeaders() },
      )
    }
    if (typeof result.validation_transaction !== 'string' || typeof result.action_label !== 'string' || !result.public_key_options) {
      return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: noStoreHeaders() })
    }
    return NextResponse.json({
      validation_transaction: result.validation_transaction,
      action_label: result.action_label,
      public_key_options: result.public_key_options,
    }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ status: failure.code === 'INVALID_ORIGIN' ? 'invalid' : 'unavailable' }, { status: failure.status, headers: noStoreHeaders() })
  }
}
