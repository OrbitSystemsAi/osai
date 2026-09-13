'use client'

import { useState, type FormEvent } from 'react'
import { browserSupportsWebAuthn, startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import './passkeys.css'

type ValidationStep = 'code' | 'ready' | 'validating' | 'success'
type ValidationResult = {
  validation_transaction: string
  action_label: string
  public_key_options: PublicKeyCredentialRequestOptionsJSON
}

const messages: Record<string, string> = {
  invalid: "We couldn't validate that request.",
  expired: 'This validation request has expired. Return to your call to start again.',
  failed: 'Passkey validation was not completed.',
  locked: 'This validation request can no longer be used.',
  unavailable: 'Validation is temporarily unavailable. Return to your call for assistance.',
}

export default function SophiaValidationPage() {
  const [code, setCode] = useState('')
  const [step, setStep] = useState<ValidationStep>('code')
  const [request, setRequest] = useState<ValidationResult | null>(null)
  const [error, setError] = useState('')

  const reset = () => {
    setCode('')
    setStep('code')
    setRequest(null)
    setError('')
  }

  const begin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(code)) return
    setError('')
    try {
      const response = await fetch('/api/osai/passkey/validation/options', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_code: code }),
      })
      const result = await response.json() as ValidationResult & { status?: string }
      if (!response.ok) throw new Error(result.status || 'unavailable')
      setRequest(result)
      setStep('ready')
    } catch (caught) {
      const status = caught instanceof Error ? caught.message : 'unavailable'
      setError(messages[status] || messages.unavailable)
    }
  }

  const validate = async () => {
    if (!request || step === 'validating') return
    setError('')
    if (!browserSupportsWebAuthn()) {
      setError(messages.failed)
      return
    }
    setStep('validating')
    try {
      const credential = await startAuthentication({ optionsJSON: request.public_key_options })
      const response = await fetch('/api/osai/passkey/validation/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ validation_transaction: request.validation_transaction, credential }),
      })
      const result = await response.json() as { status?: string }
      if (!response.ok || result.status !== 'validated') throw new Error(result.status || 'failed')
      setStep('success')
    } catch (caught) {
      const status = caught instanceof Error && caught.message in messages ? caught.message : 'failed'
      setError(messages[status])
      setStep('ready')
    }
  }

  return (
    <main className="passkey-shell validation-shell">
      <section className="passkey-card" aria-labelledby="validation-title">
        <a className="passkey-brand" href="/" aria-label="Orbit Systems home">
          <Image src="/orbit-systems-logo.png" alt="Orbit Systems — Augmented Intelligence" width={600} height={214} priority />
        </a>
        {step === 'success' ? (
          <div className="passkey-success" role="status">
            <CheckCircle2 aria-hidden="true" />
            <h1 id="validation-title">Validation complete</h1>
            <p>Validation complete. You may return to your call with Sophia.</p>
          </div>
        ) : (
          <>
            <div className="passkey-heading">
              <ShieldCheck aria-hidden="true" />
              <div>
                <p className="passkey-eyebrow">Protected OSai action</p>
                <h1 id="validation-title">Validate your request</h1>
              </div>
            </div>
            {step === 'code' ? (
              <form className="validation-form" onSubmit={begin}>
                <p>Enter the session code Sophia provided during your call.</p>
                <label htmlFor="session-code">Six-digit session code</label>
                <input
                  id="session-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                />
                <button className="passkey-primary" disabled={code.length !== 6}>Continue</button>
              </form>
            ) : (
              <div className="validation-action">
                <p className="passkey-label">Requested action</p>
                <strong>{request?.action_label}</strong>
                <button className="passkey-primary" type="button" onClick={validate} disabled={step === 'validating'}>
                  <KeyRound aria-hidden="true" />
                  {step === 'validating' ? 'Waiting for passkey…' : 'Validate with passkey'}
                </button>
                <button className="passkey-secondary" type="button" onClick={reset} disabled={step === 'validating'}>
                  <ArrowLeft aria-hidden="true" /> Cancel
                </button>
              </div>
            )}
            {error && <p className="passkey-error" role="alert">{error}</p>}
          </>
        )}
        <p className="passkey-privacy">This page validates one active OSai telephone request. The approval is short-lived, bound to that request, and cannot be reused.</p>
      </section>
    </main>
  )
}
