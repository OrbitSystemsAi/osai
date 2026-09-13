import type { Metadata } from 'next'
import PublicLegalPage from '../../src/legal/PublicLegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | Orbit Systems AI',
  description: 'How Orbit Systems AI collects, uses, protects, and shares personal information for its website, Google Sign-In, and passkey administration.',
  alternates: { canonical: 'https://orbitsystems.ai/privacy' },
}

export default function PrivacyPage() {
  return (
    <PublicLegalPage
      title="Privacy Policy"
      effectiveDate="September 13, 2026"
      introduction={
        <p>
          This Privacy Policy explains how Orbit Systems AI, LLC (“OSai,” “we,” “us,” or “our”)
          collects, uses, discloses, and protects personal information when you use
          orbitsystems.ai, sign in with Google, or manage passkeys for protected OSai actions.
        </p>
      }
      sections={[
        {
          title: '1. Information we collect',
          content: (
            <>
              <p>We collect only the information reasonably needed to operate and secure these website features:</p>
              <ul>
                <li><strong>Google Sign-In information:</strong> the basic identity fields provided through the <code>openid</code>, <code>email</code>, and <code>profile</code> scopes, such as your Google account identifier, name, email address, email-verification status, and profile image.</li>
                <li><strong>Passkey information:</strong> server-side WebAuthn public-key credential material and limited metadata, such as an opaque credential reference, a label you choose, creation date, last-used date, authenticator counters, and revocation status. Your private passkey and biometric data remain on your authenticator and are never received by OSai.</li>
                <li><strong>Security and audit information:</strong> authentication time, outcome, relevant security events, approximate network and device information, and records needed to detect abuse, investigate incidents, and demonstrate authorized administrative activity.</li>
                <li><strong>Information you provide:</strong> communications and support information you choose to send to us.</li>
              </ul>
            </>
          ),
        },
        {
          title: '2. How we use information',
          content: (
            <ul>
              <li>Authenticate approved OSai administrators and sales representatives.</li>
              <li>Enroll, display, rename, use, and revoke passkeys.</li>
              <li>Bind a passkey approval to a specific, short-lived protected OSai request.</li>
              <li>Secure the website, prevent replay and impersonation, detect abuse, and maintain appropriate audit records.</li>
              <li>Respond to questions, comply with law, and enforce our Terms of Service.</li>
            </ul>
          ),
        },
        {
          title: '3. Google user data',
          content: (
            <>
              <p>OSai requests only the Google OAuth scopes <code>openid</code>, <code>email</code>, and <code>profile</code>. We use this information to confirm the signed-in identity and determine server-side whether that identity is approved for OSai passkey administration.</p>
              <p>We do not request access to Gmail, Google Drive, calendars, contacts, or other Google product content. We do not use Google user data for advertising, credit decisions, or unrelated profiling.</p>
            </>
          ),
        },
        {
          title: '4. How we disclose information',
          content: (
            <>
              <p>We may disclose limited information to service providers that operate the website, Google authentication, Sophia’s existing Google Cloud and Firestore infrastructure, security monitoring, or legal compliance. Those providers may process information only for the applicable service or legal purpose.</p>
              <p>We may also disclose information when required by law, to protect rights and safety, or as part of a business transaction subject to appropriate safeguards.</p>
            </>
          ),
        },
        {
          title: '5. No sale of personal information',
          content: <p>OSai does not sell personal information. We do not share personal information for cross-context behavioral advertising or use Google Sign-In or passkey data for advertising.</p>,
        },
        {
          title: '6. Retention and security',
          content: (
            <>
              <p>We retain information only as long as reasonably necessary for authentication, passkey administration, security, audit, legal, and operational purposes. Retention periods vary by record type and applicable requirements.</p>
              <p>We use technical and organizational safeguards designed to protect information, including HTTPS, server-side authorization, short-lived and single-use WebAuthn challenges, access controls, and restricted audit records. No system can guarantee absolute security.</p>
            </>
          ),
        },
        {
          title: '7. Your choices and rights',
          content: (
            <p>You may stop using Google Sign-In, revoke OSai access through your Google Account, or request access, correction, or deletion of personal information, subject to applicable exceptions and records we must retain for security or legal purposes.</p>
          ),
        },
        {
          title: '8. Children’s privacy',
          content: <p>The administrative authentication and passkey features are not directed to children under 13, and we do not knowingly collect personal information from children through those features.</p>,
        },
        {
          title: '9. Changes to this policy',
          content: <p>We may update this policy as our services, practices, or legal obligations change. We will publish the updated policy here and revise the effective date.</p>,
        },
        {
          title: '10. Contact us',
          content: <p>For privacy questions or requests, contact <a href="mailto:earl@orbitsystems.ai">earl@orbitsystems.ai</a>.</p>,
        },
      ]}
    />
  )
}
