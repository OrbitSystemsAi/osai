'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { authClient, emailAuthClient } from './auth'

type AuthView = 'sign-in' | 'invite' | 'forgot-password' | 'verify-email' | 'member'

const viewFromPath = (): AuthView => {
  if (window.location.pathname.startsWith('/auth/invitation')) return 'invite'
  if (window.location.pathname.startsWith('/auth/forgot-password')) return 'forgot-password'
  if (window.location.pathname.startsWith('/auth/verify-email')) return 'verify-email'
  if (window.location.pathname.startsWith('/member')) return 'member'
  return 'sign-in'
}

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function AuthBrand() {
  return <a className="auth-brand" href="/" aria-label="Orbit Systems home">
    <span className="auth-brand-mark" aria-hidden="true"><i /><b /><em /></span>
    <span><strong>ORBIT</strong><strong>SYSTEMS</strong><small>AUGMENTED INTELLIGENCE</small></span>
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
        <p>Your account keeps invitations, agreements, and protected project access connected to one verified identity.</p>
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
  const [email, setEmail] = useState('')
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
    navigate('/member')
  }

  return <>
    <div className="auth-heading"><h2>Welcome back</h2><p>Sign in to continue to your OSai member account.</p></div>
    <form onSubmit={submit} className="auth-form">
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label>Password<span className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
      <button className="text-action forgot-link" type="button" onClick={() => navigate('/auth/forgot-password')}>Forgot password?</button>
      {error && <Message error>{error}</Message>}
      <button className="auth-primary" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <div className="auth-divider"><span />New here?<span /></div>
    <button className="auth-secondary" onClick={() => navigate('/auth/invitation')}>Accept an invitation</button>
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
      navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'We could not create your account. Please try again.'
      if (/user already exists/i.test(message)) {
        navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return <>
    <button className="text-action auth-return" onClick={() => navigate('/auth/sign-in')}><ArrowLeft size={18} /> Return to sign in</button>
    <div className="auth-heading"><h2>Accept your invitation</h2><p>Create the verified identity connected to your OSai invitation.</p></div>
    <form onSubmit={submit} className="auth-form">
      <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></label>
      <label>Invited email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label>Create password<input required type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
      {error && <Message error>{error}</Message>}
      <button className="auth-primary" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={19} /></button>
    </form>
    <p className="auth-note"><LockKeyhole size={20} />Your verified account remains subject to administrator approval and the current General NDA.</p>
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
    <div className="auth-heading"><h2>Recover your account</h2><p>We’ll send recovery instructions to your verified email address.</p></div>
    {sent ? <div className="auth-success"><Mail /><h3>Check your email</h3><p>If an account exists for {email}, recovery instructions are on the way.</p><button className="auth-secondary" onClick={() => navigate('/auth/sign-in')}>Return to sign in</button></div> : <form onSubmit={submit} className="auth-form"><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>{error && <Message error>{error}</Message>}<button className="auth-primary" disabled={busy}>{busy ? 'Sending…' : 'Send recovery email'}</button></form>}
  </>
}

function VerifyEmail() {
  const email = new URLSearchParams(window.location.search).get('email') || 'your email address'
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (email === 'your email address') return setError('Return to your invitation and use the email address that received the code.')
    setBusy(true); setError('')
    const { error: authError } = await authClient.verifyOtp({ email, token: code, type: 'signup' })
    setBusy(false)
    if (authError) return setError(authError.message || 'That verification code is invalid or has expired.')
    navigate('/member/dashboard')
  }
  return <div className="auth-success verify"><Mail /><h2>Verify your email</h2><p>We sent a six-digit verification code to <strong>{email}</strong>. Enter it before account setup can continue.</p><form className="auth-form" onSubmit={submit}><label>Verification code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" /></label>{error && <Message error>{error}</Message>}<button className="auth-primary" disabled={busy}>{busy ? 'Verifying…' : 'Verify email'}</button></form><button className="auth-secondary" onClick={() => navigate('/auth/invitation')}>Use a different email</button></div>
}

function MemberGate() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) navigate('/auth/sign-in')
      else setUserName(data.session.user?.user_metadata?.name || data.session.user?.email || 'Member')
      setLoading(false)
    })
  }, [])
  if (loading) return <p>Checking your session…</p>
  return <div className="auth-success verify"><CheckCircle2 /><h2>Signed in</h2><p>Welcome, {userName}. Your identity is verified; OSai access still depends on administrator approval and agreement status.</p><button className="auth-primary" onClick={async () => { await authClient.signOut(); navigate('/auth/sign-in') }}>Sign out</button></div>
}

export default function AuthPage() {
  const [view, setView] = useState(viewFromPath)
  useEffect(() => { const update = () => setView(viewFromPath()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update) }, [])
  return <AuthShell>{view === 'invite' ? <Invitation /> : view === 'forgot-password' ? <ForgotPassword /> : view === 'verify-email' ? <VerifyEmail /> : view === 'member' ? <MemberGate /> : <SignIn />}</AuthShell>
}
