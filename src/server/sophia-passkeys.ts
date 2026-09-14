const validationStatuses = new Set(['validated', 'invalid', 'expired', 'locked', 'failed', 'unavailable'])

export function sophiaPasskeysConfigured() {
  return Boolean(process.env.SOPHIA_API_BASE_URL?.trim())
}

export function noStoreHeaders() {
  return { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache', Vary: 'Authorization, Origin' }
}

export function passkeyEnvironmentConfiguration() {
  const environment = process.env.OSAI_PASSKEY_ENVIRONMENT?.trim()
  const rpId = process.env.OSAI_WEBAUTHN_RP_ID?.trim()
  const expectedOrigin = process.env.OSAI_WEBAUTHN_EXPECTED_ORIGIN?.trim().replace(/\/$/, '')
  const validProduction = environment === 'production' && rpId === 'orbitsystems.ai' && expectedOrigin === 'https://orbitsystems.ai'
  const validDevelopment = environment === 'development' && rpId === 'localhost' && expectedOrigin === 'http://localhost:3003'
  if (!validProduction && !validDevelopment) throw new Error('PASSKEY_ENVIRONMENT_MISCONFIGURED')
  return { environment, rpId, expectedOrigin }
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const { expectedOrigin } = passkeyEnvironmentConfiguration()
  if (origin !== expectedOrigin) throw new Error('INVALID_ORIGIN')
}

function configuration() {
  const baseUrl = process.env.SOPHIA_API_BASE_URL?.trim().replace(/\/$/, '')
  if (!baseUrl) throw new Error('SOPHIA_NOT_CONFIGURED')
  return { baseUrl }
}

function googleIdToken(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  if (!/^Bearer [^\s]+$/.test(authorization)) throw new Error('UNAUTHENTICATED')
  return authorization
}

async function requestSophia(path: string, init: RequestInit, authorization?: string) {
  const { baseUrl } = configuration()
  const controller = new AbortController()
  // Cloud Run may need more than ten seconds to serve the first request after
  // scaling from zero. Keep the proxy bounded while allowing that cold start
  // to finish so a valid administrator sign-in is not reported as a failure.
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(authorization ? { authorization } : {}),
        ...init.headers,
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function publicSophiaRequest(path: string, body: unknown) {
  return requestSophia(path, { method: 'POST', body: JSON.stringify(body) })
}

export async function administratorSophiaRequest(request: Request, path: string, init: RequestInit = {}) {
  return requestSophia(path, init, googleIdToken(request))
}

export function safeValidationStatus(value: unknown, fallback: 'invalid' | 'failed' | 'unavailable') {
  return typeof value === 'string' && validationStatuses.has(value) ? value : fallback
}

export function passkeyApiError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'UNAUTHENTICATED') return { status: 401, code: 'UNAUTHENTICATED' }
  if (message === 'INVALID_ORIGIN') return { status: 403, code: 'INVALID_ORIGIN' }
  if (message === 'PASSKEY_ENVIRONMENT_MISCONFIGURED') return { status: 503, code: 'UNAVAILABLE' }
  if (message === 'SOPHIA_NOT_CONFIGURED') return { status: 503, code: 'UNAVAILABLE' }
  return { status: 503, code: 'UNAVAILABLE' }
}

export function safeCredentialMetadata(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const credential = item as Record<string, unknown>
    if (typeof credential.credential_ref !== 'string' || typeof credential.label !== 'string' || typeof credential.created_at !== 'string') return []
    return [{
      credential_ref: credential.credential_ref,
      label: credential.label,
      created_at: credential.created_at,
      last_used_at: typeof credential.last_used_at === 'string' ? credential.last_used_at : null,
    }]
  })
}
