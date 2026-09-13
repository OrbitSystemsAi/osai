import { NextResponse } from 'next/server'
import { administratorSophiaRequest, assertTrustedOrigin, noStoreHeaders, passkeyApiError } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request)
    const response = await administratorSophiaRequest(request, '/api/osai/passkey/enrollment/options', { method: 'POST', body: '{}' })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || !result.public_key_options) return NextResponse.json({ error: 'ENROLLMENT_UNAVAILABLE' }, { status: response.status >= 500 ? 503 : 400, headers: noStoreHeaders() })
    return NextResponse.json({ public_key_options: result.public_key_options }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}
