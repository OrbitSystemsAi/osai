'use client'

import { SignIn, SignUp } from '@clerk/nextjs'

function AuthBrand() {
  return <a className="auth-brand" href="/" aria-label="Orbit Systems home">
    <span className="brand-logo-image auth-brand-logo" aria-hidden="true">
      <img className="brand-logo-base" src="/OSAI_Main-Logo.png?v=20260731" alt="" />
      <img className="brand-logo-accent" src="/OSAI_Main-Logo.png?v=20260731" alt="" />
    </span>
  </a>
}

export default function AuthPage() {
  const invitation = window.location.pathname.startsWith('/auth/invitation')
  return <main className="auth-shell">
    <aside className="auth-story">
      <AuthBrand />
      <div className="auth-orbit orbit-a" /><div className="auth-orbit orbit-b" />
      <div className="auth-story-copy"><h1>Built for trust.<br /><span>Designed for progress.</span></h1><i /><p>Your account keeps invitations, agreements, and protected project access connected to one secure identity.</p></div>
    </aside>
    <section className="auth-panel">
      <a className="back-link" href="/">Back to OSai</a>
      <div className="auth-content clerk-auth-content">
        {invitation
          ? <SignUp routing="path" path="/auth/invitation" signInUrl="/auth/sign-in" forceRedirectUrl="/member/dashboard" />
          : <SignIn routing="path" path="/auth/sign-in" signUpUrl="/auth/invitation" forceRedirectUrl="/member/dashboard" />}
      </div>
      <footer className="auth-footer"><a href="/privacy">Privacy</a><span /> <a href="/terms">Terms</a></footer>
    </section>
  </main>
}
