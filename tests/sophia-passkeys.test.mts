import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn, type ChildProcess } from 'node:child_process'
import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import {
  assertTrustedOrigin,
  noStoreHeaders,
  passkeyEnvironmentConfiguration,
  safeCredentialMetadata,
  safeValidationStatus,
} from '../src/server/sophia-passkeys.ts'
import { enrollmentOptionsBody, enrollmentVerificationBody } from '../src/passkeys/enrollment-contract.ts'

const originalFetch = globalThis.fetch
const originalBaseUrl = process.env.SOPHIA_API_BASE_URL
const passkeyEnvironmentVariables = ['OSAI_PASSKEY_ENVIRONMENT', 'OSAI_WEBAUTHN_RP_ID', 'OSAI_WEBAUTHN_EXPECTED_ORIGIN'] as const
const originalPasskeyEnvironment = Object.fromEntries(passkeyEnvironmentVariables.map((key) => [key, process.env[key]]))

test.afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalBaseUrl === undefined) delete process.env.SOPHIA_API_BASE_URL
  else process.env.SOPHIA_API_BASE_URL = originalBaseUrl
  for (const key of passkeyEnvironmentVariables) {
    const value = originalPasskeyEnvironment[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test('origin enforcement accepts only the exact configured production origin', () => {
  process.env.OSAI_PASSKEY_ENVIRONMENT = 'production'
  process.env.OSAI_WEBAUTHN_RP_ID = 'orbitsystems.ai'
  process.env.OSAI_WEBAUTHN_EXPECTED_ORIGIN = 'https://orbitsystems.ai'
  assert.doesNotThrow(() => assertTrustedOrigin(new Request('https://orbitsystems.ai', { headers: { origin: 'https://orbitsystems.ai' } })))
  assert.throws(() => assertTrustedOrigin(new Request('https://orbitsystems.ai', { headers: { origin: 'https://evil.orbitsystems.ai' } })), /INVALID_ORIGIN/)
  assert.throws(() => assertTrustedOrigin(new Request('https://orbitsystems.ai')), /INVALID_ORIGIN/)
})

test('development accepts only the localhost WebAuthn boundary', () => {
  process.env.OSAI_PASSKEY_ENVIRONMENT = 'development'
  process.env.OSAI_WEBAUTHN_RP_ID = 'localhost'
  process.env.OSAI_WEBAUTHN_EXPECTED_ORIGIN = 'http://localhost:3003'
  assert.deepEqual(passkeyEnvironmentConfiguration(), { environment: 'development', rpId: 'localhost', expectedOrigin: 'http://localhost:3003' })
  assert.doesNotThrow(() => assertTrustedOrigin(new Request('http://localhost:3003', { headers: { origin: 'http://localhost:3003' } })))
  assert.throws(() => assertTrustedOrigin(new Request('http://localhost:3003', { headers: { origin: 'https://orbitsystems.ai' } })), /INVALID_ORIGIN/)
})

test('mixed production and development WebAuthn settings fail closed', () => {
  process.env.OSAI_PASSKEY_ENVIRONMENT = 'development'
  process.env.OSAI_WEBAUTHN_RP_ID = 'orbitsystems.ai'
  process.env.OSAI_WEBAUTHN_EXPECTED_ORIGIN = 'http://localhost:3003'
  assert.throws(() => passkeyEnvironmentConfiguration(), /PASSKEY_ENVIRONMENT_MISCONFIGURED/)
})

test('only documented generic validation statuses reach the browser', () => {
  assert.equal(safeValidationStatus('expired', 'failed'), 'expired')
  assert.equal(safeValidationStatus('admin_record_missing', 'failed'), 'failed')
  assert.equal(safeValidationStatus({ internal: true }, 'invalid'), 'invalid')
})

test('credential metadata strips every field outside the browser-safe contract', () => {
  const internalValue = randomUUID()
  assert.deepEqual(safeCredentialMetadata([{
    credential_ref: 'opaque_ref', label: 'Security key', created_at: '2026-09-13T00:00:00Z', last_used_at: null,
    internal_field: internalValue,
  }]), [{ credential_ref: 'opaque_ref', label: 'Security key', created_at: '2026-09-13T00:00:00Z', last_used_at: null }])
})

test('responses are explicitly non-cacheable', () => {
  assert.equal(noStoreHeaders()['Cache-Control'], 'no-store, max-age=0')
  assert.equal(noStoreHeaders().Pragma, 'no-cache')
})

test('browser enrollment binds the label at options time and transaction at verification time', () => {
  const registrationTransaction = randomUUID()
  const credential = { id: randomUUID(), response: {} }
  assert.deepEqual(enrollmentOptionsBody('  Recovery key  '), { label: 'Recovery key' })
  assert.deepEqual(enrollmentVerificationBody(registrationTransaction, credential), {
    registration_transaction: registrationTransaction,
    credential,
  })
  assert.equal('label' in enrollmentVerificationBody(registrationTransaction, credential), false)
})

test('Next.js routes proxy the approved contracts and fail closed', async (context) => {
  const testSessionCode = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const testChallenge = randomBytes(24).toString('base64url')
  const testRegistrationChallenge = randomBytes(24).toString('base64url')
  const testRegistrationTransaction = randomUUID()
  const testTransaction = randomUUID()
  const testAuthorization = `Bearer ${randomUUID()}`
  const requests: Array<{ url: string; authorization: string; body: string }> = []
  const mockSophia: Server = createServer((request, response) => {
    let body = ''
    request.on('data', (chunk) => { body += String(chunk) })
    request.on('end', () => {
      requests.push({ url: request.url || '', authorization: String(request.headers.authorization || ''), body })
      response.setHeader('content-type', 'application/json')
      if (request.url === '/api/osai/passkey/validation/options') response.end(JSON.stringify({ validation_transaction: testTransaction, action_label: 'Approve requested Sophia action', public_key_options: { challenge: testChallenge }, internal_field: randomUUID() }))
      else if (request.url === '/api/osai/passkey/validation/verify') response.end(JSON.stringify({ status: 'validated', internal_authorization: 'private' }))
      else if (request.url === '/api/osai/passkey/enrollment/options') response.end(JSON.stringify({ registration_transaction: testRegistrationTransaction, public_key_options: { challenge: testRegistrationChallenge }, internal_field: randomUUID() }))
      else if (request.url === '/api/osai/passkey/enrollment/verify') response.end(JSON.stringify({ status: 'registered', credential_id: 'private' }))
      else if (request.url === '/api/osai/passkey/credentials' && request.method === 'GET') response.end(JSON.stringify({ administrator: { display_name: 'Approved administrator', internal_field: randomUUID() }, credentials: [{ credential_ref: 'safe_ref', label: 'Laptop', created_at: '2026-09-13', internal_field: randomUUID() }] }))
      else if (request.url === '/api/osai/passkey/credentials/safe_ref' && request.method === 'PATCH') response.end(JSON.stringify({ status: 'updated', public_key: 'private' }))
      else if (request.url === '/api/osai/passkey/credentials/safe_ref' && request.method === 'DELETE') { response.statusCode = 204; response.end() }
      else { response.statusCode = 404; response.end(JSON.stringify({ status: 'invalid' })) }
    })
  })
  await new Promise<void>((resolve) => mockSophia.listen(0, '127.0.0.1', resolve))
  const address = mockSophia.address()
  assert(address && typeof address === 'object')
  const applicationPort = 3103
  let applicationOutput = ''
  const application: ChildProcess = spawn('./node_modules/.bin/next', ['start', '-p', String(applicationPort)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      OSAI_PASSKEY_ENVIRONMENT: 'production',
      OSAI_WEBAUTHN_RP_ID: 'orbitsystems.ai',
      OSAI_WEBAUTHN_EXPECTED_ORIGIN: 'https://orbitsystems.ai',
      SOPHIA_API_BASE_URL: `http://127.0.0.1:${address.port}`,
    },
  })
  application.stdout?.on('data', (chunk) => { applicationOutput += String(chunk) })
  application.stderr?.on('data', (chunk) => { applicationOutput += String(chunk) })
  context.after(() => { application.kill('SIGTERM'); mockSophia.close() })
  let validationPage: Response | undefined
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { const response = await fetch(`http://127.0.0.1:${applicationPort}/validate`); if (response.ok) { validationPage = response; break } } catch { /* wait for server */ }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  assert(validationPage, applicationOutput)
  assert.match(validationPage.headers.get('cache-control') || '', /no-store/)
  assert.match(validationPage.headers.get('content-security-policy') || '', /frame-ancestors 'none'/)
  assert.equal(validationPage.headers.has('x-clerk-auth-status'), false)

  const administratorPage = await fetch(`http://127.0.0.1:${applicationPort}/admin/passkeys`)
  assert.equal(administratorPage.status, 200)
  assert.match(administratorPage.headers.get('cache-control') || '', /no-store/)
  assert.equal(administratorPage.headers.has('x-clerk-auth-status'), false)

  const validation = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/validation/options`, { method: 'POST', headers: { origin: 'https://orbitsystems.ai', 'content-type': 'application/json' }, body: JSON.stringify({ session_code: testSessionCode }) })
  assert.equal(validation.status, 200, applicationOutput)
  assert.deepEqual(await validation.json(), { validation_transaction: testTransaction, action_label: 'Approve requested Sophia action', public_key_options: { challenge: testChallenge } })
  assert.equal(requests[0]?.authorization, '')
  assert.deepEqual(JSON.parse(requests[0]?.body || '{}'), { session_code: testSessionCode })

  const verification = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/validation/verify`, { method: 'POST', headers: { origin: 'https://orbitsystems.ai', 'content-type': 'application/json' }, body: JSON.stringify({ validation_transaction: testTransaction, credential: {} }) })
  assert.equal(verification.status, 200)
  assert.deepEqual(await verification.json(), { status: 'validated' })

  const credentials = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/credentials`, { headers: { authorization: testAuthorization } })
  assert.equal(credentials.status, 200)
  assert.deepEqual(await credentials.json(), { administrator: { display_name: 'Approved administrator' }, credentials: [{ credential_ref: 'safe_ref', label: 'Laptop', created_at: '2026-09-13', last_used_at: null }] })
  assert.equal(requests[2]?.authorization, testAuthorization)

  const enrollmentOptions = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/enrollment/options`, { method: 'POST', headers: { origin: 'https://orbitsystems.ai', authorization: testAuthorization, 'content-type': 'application/json' }, body: JSON.stringify({ label: 'Security key' }) })
  assert.equal(enrollmentOptions.status, 200)
  assert.deepEqual(await enrollmentOptions.json(), { registration_transaction: testRegistrationTransaction, public_key_options: { challenge: testRegistrationChallenge } })
  assert.equal(requests[3]?.authorization, testAuthorization)
  assert.deepEqual(JSON.parse(requests[3]?.body || '{}'), { label: 'Security key' })

  const enrollmentVerify = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/enrollment/verify`, { method: 'POST', headers: { origin: 'https://orbitsystems.ai', authorization: testAuthorization, 'content-type': 'application/json' }, body: JSON.stringify({ registration_transaction: testRegistrationTransaction, credential: {} }) })
  assert.equal(enrollmentVerify.status, 200)
  assert.deepEqual(await enrollmentVerify.json(), { status: 'registered' })
  assert.deepEqual(JSON.parse(requests[4]?.body || '{}'), { registration_transaction: testRegistrationTransaction, credential: {} })

  const missingEnrollmentTransaction = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/enrollment/verify`, { method: 'POST', headers: { origin: 'https://orbitsystems.ai', authorization: testAuthorization, 'content-type': 'application/json' }, body: JSON.stringify({ credential: {}, label: 'Security key' }) })
  assert.equal(missingEnrollmentTransaction.status, 400)
  assert.deepEqual(await missingEnrollmentTransaction.json(), { error: 'INVALID_REQUEST' })
  assert.equal(requests.length, 5)

  const renamed = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/credentials/safe_ref`, { method: 'PATCH', headers: { origin: 'https://orbitsystems.ai', authorization: testAuthorization, 'content-type': 'application/json' }, body: JSON.stringify({ label: 'Recovery key' }) })
  assert.equal(renamed.status, 200)
  assert.deepEqual(await renamed.json(), { status: 'updated' })

  const revoked = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/credentials/safe_ref`, { method: 'DELETE', headers: { origin: 'https://orbitsystems.ai', authorization: testAuthorization } })
  assert.equal(revoked.status, 204)

  const unauthenticated = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/credentials`)
  assert.equal(unauthenticated.status, 401)
  assert.deepEqual(await unauthenticated.json(), { error: 'UNAUTHENTICATED' })

  const crossSite = await fetch(`http://127.0.0.1:${applicationPort}/api/osai/passkey/validation/options`, { method: 'POST', headers: { origin: 'https://attacker.example', 'content-type': 'application/json' }, body: JSON.stringify({ session_code: testSessionCode }) })
  assert.equal(crossSite.status, 403)
  assert.deepEqual(await crossSite.json(), { status: 'invalid' })
})
