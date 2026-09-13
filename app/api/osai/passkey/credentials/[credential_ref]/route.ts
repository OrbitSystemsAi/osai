import { NextResponse } from 'next/server'
import { administratorSophiaRequest, assertTrustedOrigin, noStoreHeaders, passkeyApiError } from '../../../../../../src/server/sophia-passkeys'

export const runtime = 'nodejs'

function validReference(value: string) {
  return /^[A-Za-z0-9_-]{1,200}$/.test(value)
}

export async function PATCH(request: Request, context: { params: Promise<{ credential_ref: string }> }) {
  try {
    assertTrustedOrigin(request)
    const { credential_ref: credentialRef } = await context.params
    const body = await request.json() as { label?: unknown }
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 80) : ''
    if (!validReference(credentialRef) || !label) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: noStoreHeaders() })
    const response = await administratorSophiaRequest(request, `/api/osai/passkey/credentials/${encodeURIComponent(credentialRef)}`, { method: 'PATCH', body: JSON.stringify({ label }) })
    if (!response.ok) return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: response.status >= 500 ? 503 : response.status, headers: noStoreHeaders() })
    return NextResponse.json({ status: 'updated' }, { headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ credential_ref: string }> }) {
  try {
    assertTrustedOrigin(request)
    const { credential_ref: credentialRef } = await context.params
    if (!validReference(credentialRef)) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: noStoreHeaders() })
    const response = await administratorSophiaRequest(request, `/api/osai/passkey/credentials/${encodeURIComponent(credentialRef)}`, { method: 'DELETE' })
    if (!response.ok) return NextResponse.json({ error: 'REVOCATION_FAILED' }, { status: response.status >= 500 ? 503 : response.status, headers: noStoreHeaders() })
    return new NextResponse(null, { status: 204, headers: noStoreHeaders() })
  } catch (error) {
    const failure = passkeyApiError(error)
    return NextResponse.json({ error: failure.code }, { status: failure.status, headers: noStoreHeaders() })
  }
}
