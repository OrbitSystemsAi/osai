import { NextResponse } from 'next/server'
import { administratorSophiaRequest, noStoreHeaders, passkeyApiError, safeCredentialMetadata } from '../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const response = await administratorSophiaRequest(request, '/api/osai/passkey/credentials')
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || !Array.isArray(result.credentials)) return NextResponse.json({ error: 'CREDENTIALS_UNAVAILABLE' }, { status: response.status >= 500 ? 503 : response.status, headers: noStoreHeaders() })
    const administrator = result.administrator && typeof result.administrator === 'object' ? result.administrator as Record<string, unknown> : {}
    const displayName = typeof administrator.display_name === 'string' ? administrator.display_name : 'Authorized OSai administrator'
    return NextResponse.json({ administrator: { display_name: displayName }, credentials: safeCredentialMetadata(result.credentials) }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}
