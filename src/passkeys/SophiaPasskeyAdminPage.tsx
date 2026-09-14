'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { browserSupportsWebAuthn, startRegistration, type PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser'
import { ArrowLeft, KeyRound, LogOut, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Script from 'next/script'
import { enrollmentOptionsBody, enrollmentVerificationBody } from './enrollment-contract'
import './passkeys.css'
import './google-passkeys.css'

type Credential = { credential_ref: string; label: string; created_at: string; last_used_at: string | null }
type GoogleCredentialResponse = { credential?: string }
type GoogleIdentity = {
  accounts: { id: {
    initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void
    renderButton: (element: HTMLElement, options: { type: string; theme: string; size: string; text: string; shape: string; width: number }) => void
    disableAutoSelect: () => void
  } }
}

declare global { interface Window { google?: GoogleIdentity } }

function formatDate(value: string | null) {
  if (!value) return 'Not used yet'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

export default function SophiaPasskeyAdminPage({ googleClientId }: { googleClientId: string }) {
  const googleButton = useRef<HTMLDivElement>(null)
  const [idToken, setIdToken] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [label, setLabel] = useState('Primary device')
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [googleReady, setGoogleReady] = useState(false)

  const authenticatedFetch = useCallback((url: string, init: RequestInit = {}) => fetch(url, {
    ...init,
    cache: 'no-store',
    headers: { authorization: `Bearer ${idToken}`, ...init.headers },
  }), [idToken])

  const load = useCallback(async () => {
    if (!idToken) return
    setError('')
    const response = await authenticatedFetch('/api/osai/passkey/credentials')
    const result = await response.json().catch(() => ({})) as { administrator?: { display_name?: string }; credentials?: Credential[] }
    if (!response.ok || !result.credentials) throw new Error(response.status === 401 || response.status === 403 ? 'This Google account is not authorized for OSai passkey management.' : 'Could not load your Sophia passkeys.')
    setDisplayName(result.administrator?.display_name || 'Authorized OSai administrator')
    setCredentials(result.credentials)
  }, [authenticatedFetch, idToken])

  useEffect(() => { void load().catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load your Sophia passkeys.')) }, [load])

  const configureGoogle = useCallback(() => {
    if (!googleClientId || !window.google || !googleButton.current) return
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: ({ credential }) => {
        setMessage('')
        setError('')
        setIdToken(credential || '')
      },
    })
    googleButton.current.replaceChildren()
    window.google.accounts.id.renderButton(googleButton.current, { type: 'standard', theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', width: 300 })
    setGoogleReady(true)
  }, [googleClientId])

  useEffect(() => { if (window.google) configureGoogle() }, [configureGoogle])

  const signOut = () => {
    window.google?.accounts.id.disableAutoSelect()
    setIdToken('')
    setDisplayName('')
    setCredentials([])
    setMessage('')
    setError('')
    queueMicrotask(configureGoogle)
  }

  const add = async () => {
    if (busy || !label.trim()) return
    setBusy('add'); setMessage(''); setError('')
    try {
      if (!browserSupportsWebAuthn()) throw new Error('This browser does not support passkeys.')
      const optionsResponse = await authenticatedFetch('/api/osai/passkey/enrollment/options', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(enrollmentOptionsBody(label)),
      })
      const optionsResult = await optionsResponse.json().catch(() => ({})) as { registration_transaction?: string; public_key_options?: PublicKeyCredentialCreationOptionsJSON }
      if (!optionsResponse.ok || !optionsResult.registration_transaction || !optionsResult.public_key_options) throw new Error('Passkey enrollment is temporarily unavailable.')
      const credential = await startRegistration({ optionsJSON: optionsResult.public_key_options })
      const verifyResponse = await authenticatedFetch('/api/osai/passkey/enrollment/verify', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(enrollmentVerificationBody(optionsResult.registration_transaction, credential)),
      })
      const result = await verifyResponse.json().catch(() => ({})) as { status?: string }
      if (!verifyResponse.ok || result.status !== 'registered') throw new Error('Passkey enrollment was not completed.')
      await load(); setMessage('Your Sophia passkey has been added.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Passkey enrollment was not completed.')
    } finally { setBusy('') }
  }

  const rename = async (credential: Credential) => {
    const nextLabel = window.prompt('Enter a new safe label for this passkey.', credential.label)?.trim()
    if (!nextLabel || nextLabel === credential.label) return
    setBusy(credential.credential_ref); setMessage(''); setError('')
    try {
      const response = await authenticatedFetch(`/api/osai/passkey/credentials/${encodeURIComponent(credential.credential_ref)}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label: nextLabel.slice(0, 80) }),
      })
      if (!response.ok) throw new Error('The passkey could not be renamed.')
      await load(); setMessage('The passkey label has been updated.')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The passkey could not be renamed.') }
    finally { setBusy('') }
  }

  const revoke = async (credential: Credential) => {
    if (!window.confirm(`Revoke “${credential.label}”? It will no longer approve protected Sophia actions.`)) return
    setBusy(credential.credential_ref); setMessage(''); setError('')
    try {
      const response = await authenticatedFetch(`/api/osai/passkey/credentials/${encodeURIComponent(credential.credential_ref)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('The passkey could not be revoked.')
      await load(); setMessage('The passkey has been revoked.')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The passkey could not be revoked.') }
    finally { setBusy('') }
  }

  return (
    <main className="passkey-shell admin-passkey-shell">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={configureGoogle} onError={() => setError('Google sign-in is temporarily unavailable.')} />
      <section className="passkey-admin" aria-labelledby="passkey-admin-title">
        <header className="passkey-admin-header">
          <a href="/"><ArrowLeft aria-hidden="true" /> Orbit Systems home</a>
          <Image src="/orbit-systems-logo.png" alt="Orbit Systems — Augmented Intelligence" width={600} height={214} priority />
        </header>
        {!idToken || !displayName ? (
          <section className="passkey-signin" aria-labelledby="passkey-admin-title">
            <ShieldCheck aria-hidden="true" />
            <h1 id="passkey-admin-title">Sophia passkeys</h1>
            <p>Sign in with an approved OSai administrator Google account to manage protected-action passkeys.</p>
            {!googleClientId ? <p className="passkey-error" role="alert">Google administrator sign-in is not configured in this environment.</p> : <div ref={googleButton} className="google-signin-button" aria-label="Google administrator sign-in" />}
            {googleClientId && !googleReady && <p className="passkey-loading" role="status">Loading secure sign-in…</p>}
            {error && <p className="passkey-error" role="alert">{error}</p>}
          </section>
        ) : (
          <>
            <div className="passkey-heading passkey-admin-heading">
              <ShieldCheck aria-hidden="true" />
              <div><p className="passkey-eyebrow">Authenticated administrator: {displayName}</p><h1 id="passkey-admin-title">Sophia passkeys</h1><p>Manage the trusted devices that can approve protected OSai telephone actions.</p></div>
              <button className="passkey-signout" type="button" onClick={signOut}><LogOut aria-hidden="true" /> Sign out</button>
            </div>
            <section className="passkey-enroll" aria-labelledby="enroll-title">
              <div><h2 id="enroll-title">Add passkey</h2><p>Use a descriptive device label that does not contain private information.</p></div>
              <label>Passkey label<input value={label} onChange={(event) => setLabel(event.target.value.slice(0, 80))} maxLength={80} /></label>
              <button className="passkey-primary" type="button" onClick={add} disabled={Boolean(busy) || !label.trim()}><Plus aria-hidden="true" />{busy === 'add' ? 'Waiting for passkey…' : 'Add passkey'}</button>
            </section>
            <div className="passkey-recommendation"><KeyRound aria-hidden="true" /><p><strong>Enroll at least two authenticators.</strong> A second device or security key provides a recovery path if your primary device is unavailable.</p></div>
            <section className="passkey-list" aria-labelledby="enrolled-title">
              <h2 id="enrolled-title">Enrolled passkeys</h2>
              {credentials.length ? credentials.map((credential) => (
                <article key={credential.credential_ref}><KeyRound aria-hidden="true" /><div><strong>{credential.label}</strong><span>Created {formatDate(credential.created_at)} · Last used {formatDate(credential.last_used_at)}</span></div><button type="button" onClick={() => void rename(credential)} disabled={Boolean(busy)}><Pencil aria-hidden="true" /> Rename</button><button className="danger" type="button" onClick={() => void revoke(credential)} disabled={Boolean(busy)}><Trash2 aria-hidden="true" /> Revoke</button></article>
              )) : <p className="passkey-empty">No Sophia passkeys are enrolled for this administrator.</p>}
            </section>
            {message && <p className="passkey-message" role="status">{message}</p>}
            {error && <p className="passkey-error" role="alert">{error}</p>}
          </>
        )}
      </section>
    </main>
  )
}
