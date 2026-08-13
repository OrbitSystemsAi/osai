import { createHmac, createSign, timingSafeEqual } from 'node:crypto'
import { auth, currentUser } from '@clerk/nextjs/server'

type Member = { id: string; name: string; email: string; hasExplicitName: boolean }

const required = ['DOCUSIGN_INTEGRATION_KEY', 'DOCUSIGN_USER_ID', 'DOCUSIGN_ACCOUNT_ID', 'DOCUSIGN_PRIVATE_KEY', 'DOCUSIGN_GENERAL_NDA_TEMPLATE_ID', 'DOCUSIGN_STATE_SECRET'] as const

export function docusignConfigured() {
  return required.every((key) => Boolean(process.env[key]?.trim()))
}

export async function requireMember(request?: Request): Promise<Member> {
  void request
  const { userId } = await auth()
  if (!userId) throw new Error('UNAUTHENTICATED')
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  if (!user || !email) throw new Error('UNAUTHENTICATED')
  const explicitName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  // Imported identities may retain the former application ID in externalId.
  // Otherwise authorization reconciles the verified email once on first use.
  return { id: user.externalId || user.id, email, name: explicitName || email.split('@')[0], hasExplicitName: Boolean(explicitName) }
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

async function accessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({
    iss: process.env.DOCUSIGN_INTEGRATION_KEY,
    sub: process.env.DOCUSIGN_USER_ID,
    aud: process.env.DOCUSIGN_OAUTH_HOST || 'account-d.docusign.com',
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${body}`)
  const assertion = `${header}.${body}.${signer.sign(process.env.DOCUSIGN_PRIVATE_KEY!.replace(/\\n/g, '\n'), 'base64url')}`
  const response = await fetch(`https://${process.env.DOCUSIGN_OAUTH_HOST || 'account-d.docusign.com'}/oauth/token`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }), cache: 'no-store',
  })
  const payload = await response.json()
  if (!response.ok) {
    if (payload?.error === 'consent_required') throw new Error('DOCUSIGN_CONSENT_REQUIRED')
    throw new Error(payload?.error_description || payload?.message || 'DOCUSIGN_AUTH_FAILED')
  }
  return payload.access_token as string
}

async function api(path: string, init: RequestInit = {}) {
  const token = await accessToken()
  const base = process.env.DOCUSIGN_API_BASE_URL || 'https://demo.docusign.net/restapi'
  const response = await fetch(`${base}/v2.1/accounts/${process.env.DOCUSIGN_ACCOUNT_ID}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...init.headers },
    cache: 'no-store',
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || payload?.errorCode || 'DOCUSIGN_API_FAILED')
  return payload
}

export async function createSigningView(member: Member, returnUrl: string) {
  const envelope = await api('/envelopes', { method: 'POST', body: JSON.stringify({
    templateId: process.env.DOCUSIGN_GENERAL_NDA_TEMPLATE_ID,
    templateRoles: [{ email: member.email, name: member.name, roleName: process.env.DOCUSIGN_SIGNER_ROLE || 'Signer', clientUserId: member.id }],
    status: 'sent',
  }) })
  const view = await api(`/envelopes/${envelope.envelopeId}/views/recipient`, { method: 'POST', body: JSON.stringify({
    returnUrl, authenticationMethod: 'none', email: member.email, userName: member.name, clientUserId: member.id,
  }) })
  return { envelopeId: envelope.envelopeId as string, url: view.url as string }
}

export async function envelopeStatus(envelopeId: string) {
  const envelope = await api(`/envelopes/${encodeURIComponent(envelopeId)}`)
  return { status: String(envelope.status || '').toLowerCase(), completedAt: envelope.completedDateTime || null }
}

export function sealEnvelope(memberId: string, envelopeId: string) {
  const value = base64url(JSON.stringify({ memberId, envelopeId }))
  const signature = createHmac('sha256', process.env.DOCUSIGN_STATE_SECRET!).update(value).digest('base64url')
  return `${value}.${signature}`
}

export function openEnvelope(memberId: string, cookie?: string) {
  if (!cookie) return null
  const [value, supplied] = cookie.split('.')
  if (!value || !supplied) return null
  const expected = createHmac('sha256', process.env.DOCUSIGN_STATE_SECRET!).update(value).digest()
  const actual = Buffer.from(supplied, 'base64url')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  const data = JSON.parse(Buffer.from(value, 'base64url').toString())
  return data.memberId === memberId ? String(data.envelopeId) : null
}
