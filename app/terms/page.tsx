import type { Metadata } from 'next'
import PublicLegalPage from '../../src/legal/PublicLegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service | Orbit Systems AI',
  description: 'Terms governing use of the Orbit Systems AI website, Google Sign-In, and passkey administration.',
  alternates: { canonical: 'https://orbitsystems.ai/terms' },
}

export default function TermsPage() {
  return (
    <PublicLegalPage
      title="Terms of Service"
      effectiveDate="September 13, 2026"
      introduction={
        <p>
          These Terms of Service (“Terms”) govern access to and use of orbitsystems.ai and its
          authentication and passkey-administration features. By using these services, you agree
          to these Terms. If you do not agree, do not use the services.
        </p>
      }
      sections={[
        {
          title: '1. Who may use the services',
          content: (
            <p>You must be legally able to enter into these Terms. Restricted administrative features may be used only by people OSai has expressly authorized. A successful Google sign-in does not by itself grant authorization.</p>
          ),
        },
        {
          title: '2. Google Sign-In',
          content: (
            <>
              <p>OSai uses Google OAuth to confirm basic identity information through the <code>openid</code>, <code>email</code>, and <code>profile</code> scopes. We do not ask for your Google password and do not require an OAuth client secret in your browser.</p>
              <p>You are responsible for protecting your Google account and promptly notifying OSai if you suspect unauthorized access.</p>
            </>
          ),
        },
        {
          title: '3. Passkeys and protected actions',
          content: (
            <>
              <p>Approved users may enroll passkeys to authorize protected OSai actions. A passkey uses WebAuthn and a trusted authenticator such as Face ID, Touch ID, a device PIN, or a security key. The private key remains on the authenticator.</p>
              <p>You must enroll passkeys only on devices or authenticators you control, protect those devices, maintain an appropriate recovery authenticator, and promptly revoke a credential that is lost, shared, or compromised.</p>
              <p>A passkey validation applies only to the server-identified action and session for which it was requested. You may not attempt to reuse, transfer, intercept, circumvent, or misrepresent an authorization.</p>
            </>
          ),
        },
        {
          title: '4. Acceptable use',
          content: (
            <ul>
              <li>Do not access accounts, records, credentials, or functions you are not authorized to use.</li>
              <li>Do not probe, disrupt, reverse engineer, overload, or bypass website security or rate limits.</li>
              <li>Do not submit malicious code, impersonate another person, or use the services unlawfully.</li>
              <li>Do not disclose session codes, authentication tokens, protected information, or credential details to unauthorized parties.</li>
            </ul>
          ),
        },
        {
          title: '5. Security records and privacy',
          content: (
            <p>OSai may maintain authentication, passkey-metadata, and security/audit records needed to operate the services, investigate incidents, and confirm authorized activity. Our collection and use of personal information is described in the <a href="/privacy">Privacy Policy</a>. OSai does not sell personal information.</p>
          ),
        },
        {
          title: '6. Suspension and termination',
          content: (
            <p>OSai may restrict or terminate access to protect the services or other users, respond to suspected compromise or misuse, comply with law, or withdraw an authorization. You may stop using the services at any time.</p>
          ),
        },
        {
          title: '7. Ownership',
          content: (
            <p>OSai and its licensors retain all rights in the website, software, branding, documentation, and related materials. These Terms grant only the limited right to use the services as authorized and do not transfer ownership or intellectual-property rights.</p>
          ),
        },
        {
          title: '8. Service availability and disclaimers',
          content: (
            <p>The services are provided on an “as is” and “as available” basis to the extent permitted by law. OSai does not promise uninterrupted or error-free availability. Authentication or passkey validation may fail because of device, browser, network, provider, configuration, or security conditions.</p>
          ),
        },
        {
          title: '9. Limitation of liability',
          content: (
            <p>To the fullest extent permitted by law, OSai will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, business, or goodwill arising from use of or inability to use these services. Applicable law may provide rights that cannot be limited by these Terms.</p>
          ),
        },
        {
          title: '10. Changes',
          content: (
            <p>OSai may update the services or these Terms. Updated Terms will be published at this URL with a revised effective date. Continued use after an update constitutes acceptance where permitted by law.</p>
          ),
        },
        {
          title: '11. Governing law',
          content: (
            <p>These Terms are governed by Florida law, without regard to conflict-of-law principles. Any dispute must be brought in a state or federal court with jurisdiction in Pinellas County, Florida, except where applicable law requires otherwise.</p>
          ),
        },
        {
          title: '12. Contact',
          content: <p>Questions about these Terms may be sent to <a href="mailto:earl@orbitsystems.ai">earl@orbitsystems.ai</a>.</p>,
        },
      ]}
    />
  )
}
