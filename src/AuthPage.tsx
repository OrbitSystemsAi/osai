'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { authClient, emailAuthClient } from './auth'

type AuthView = 'sign-in' | 'invite' | 'forgot-password' | 'member'

const viewFromPath = (): AuthView => {
  if (window.location.pathname.startsWith('/auth/invitation')) return 'invite'
  if (window.location.pathname.startsWith('/auth/forgot-password')) return 'forgot-password'
  if (window.location.pathname.startsWith('/member')) return 'member'
  return 'sign-in'
}

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function AuthBrand() {
  return <a className="auth-brand" href="/" aria-label="Orbit Systems home">
    <span className="brand-logo-image auth-brand-logo" aria-hidden="true">
      <img className="brand-logo-base" src="/OSAI_Main-Logo.png?v=20260731" alt="" />
      <img className="brand-logo-accent" src="/OSAI_Main-Logo.png?v=20260731" alt="" />
    </span>
  </a>
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell">
    <aside className="auth-story">
      <AuthBrand />
      <div className="auth-orbit orbit-a" /><div className="auth-orbit orbit-b" />
      <div className="auth-story-copy">
        <h1>Built for trust.<br /><span>Designed for progress.</span></h1>
        <i />
        <p>Your account keeps invitations, agreements, and protected project access connected to one secure identity.</p>
      </div>
    </aside>
    <section className="auth-panel">
      <a className="back-link" href="/" onClick={(event) => { event.preventDefault(); window.location.href = '/' }}><ArrowLeft size={19} /> Back to OSai</a>
      <div className="auth-content">{children}</div>
      <footer className="auth-footer"><a href="/privacy">Privacy</a><span /> <a href="/terms">Terms</a></footer>
    </section>
  </main>
}

function Message({ error, children }: { error?: boolean; children: React.ReactNode }) {
  return <div className={`form-message ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div>
}

function SignIn() {
  const [email, setEmail] = useState(new URLSearchParams(window.location.search).get('email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    const { error: authError } = await authClient.signInWithPassword({ email, password })
    setBusy(false)
    if (authError) return setError(authError.message || 'We could not sign you in. Check your details and try again.')
    window.location.assign('/member/dashboard')
  }

  return <>
    <div className="auth-heading"><h2>Welcome</h2><p>Sign in to continue to your OSai member account.</p></div>
    <form onSubmit={submit} className="auth-form">
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label>Password<span className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
      <button className="text-action forgot-link" type="button" onClick={() => navigate('/auth/forgot-password')}>Forgot password?</button>
      {error && <Message error>{error}</Message>}
      <button className="auth-primary" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <div className="auth-divider"><span />New here?<span /></div>
    <div className="invitation-section" aria-label="Invitation options">
      <p>Invitation</p>
      <div className="invitation-actions">
        <button className="auth-secondary" onClick={() => navigate('/auth/invitation')}>Accept</button>
        <a className="auth-secondary" href="mailto:hello@osai.com?subject=OSai%20access%20request">Request</a>
      </div>
    </div>
    <p className="auth-note"><LockKeyhole size={20} />Access is invitation-only. Creating an account does not grant access to protected materials.</p>
  </>
}

function Invitation() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState(new URLSearchParams(window.location.search).get('email') || '')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      const { error: authError } = await emailAuthClient.signUp.email({ email, password, name })
      if (authError) throw authError
      const { error: signInError } = await authClient.signInWithPassword({ email, password })
      if (signInError) throw signInError
      navigate('/member/dashboard')
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'We could not create your account. Please try again.'
      if (/user already exists/i.test(message)) {
        navigate(`/auth/sign-in?email=${encodeURIComponent(email)}`)
        return
      }
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return <>
    <button className="text-action auth-return" onClick={() => navigate('/auth/sign-in')}><ArrowLeft size={18} /> Return to sign in</button>
    <div className="auth-heading"><h2>Accept your invitation</h2><p>Create the secure identity connected to your OSai invitation.</p></div>
    <form onSubmit={submit} className="auth-form">
      <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></label>
      <label>Invited email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label>Create password<input required type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
      {error && <Message error>{error}</Message>}
      <button className="auth-primary" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={19} /></button>
    </form>
    <p className="auth-note"><LockKeyhole size={20} />Your account remains subject to administrator approval and the current General NDA.</p>
  </>
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError('')
    const { error: authError } = await authClient.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` })
    setBusy(false)
    if (authError) return setError(authError.message || 'We could not send the recovery email. Please try again.')
    setSent(true)
  }
  return <>
    <button className="text-action auth-return" onClick={() => navigate('/auth/sign-in')}><ArrowLeft size={18} /> Return to sign in</button>
    <div className="auth-heading"><h2>Recover your account</h2><p>We’ll send recovery instructions to your account email address.</p></div>
    {sent ? <div className="auth-success"><Mail /><h3>Check your email</h3><p>If an account exists for {email}, recovery instructions are on the way.</p><button className="auth-secondary" onClick={() => navigate('/auth/sign-in')}>Return to sign in</button></div> : <form onSubmit={submit} className="auth-form"><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>{error && <Message error>{error}</Message>}<button className="auth-primary" disabled={busy}>{busy ? 'Sending…' : 'Send recovery email'}</button></form>}
  </>
}

function MemberGate() {
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) navigate('/auth/sign-in')
      else window.location.replace('/member/dashboard')
    })
  }, [])
  return <p>Opening your OSai hub…</p>
}

export default function AuthPage() {
  const [view, setView] = useState(viewFromPath)
  useEffect(() => { const update = () => setView(viewFromPath()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update) }, [])
  return <AuthShell>{view === 'invite' ? <Invitation /> : view === 'forgot-password' ? <ForgotPassword /> : view === 'member' ? <MemberGate /> : <SignIn />}</AuthShell>
}
