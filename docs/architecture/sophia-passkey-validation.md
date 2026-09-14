# Sophia Protected-Action Passkey Validation

## Outcome and scope

Sophia passkey validation is an OSai-only, step-up security boundary invoked only when an eligible caller requests a protected telephone action. It is additional to all existing caller recognition and OSai procedures. Normal calls remain frictionless, and no part of this feature belongs in a Sophia Client Clone.

The website never decides caller or administrator authorization and never activates a privileged action. Sophia's existing Google Cloud/Firestore backend owns authorization, WebAuthn verification, credential records, validation-session state, audit records, expiration, rate limiting, three-attempt lockout, and single-use consumption.

## Website routes

- `GET /validate` — focused public six-digit code entry and WebAuthn authentication.
- `GET /admin/passkeys` — Google-authenticated administrator enrollment and credential management.
- `POST /api/osai/passkey/validation/options`
- `POST /api/osai/passkey/validation/verify`
- `POST /api/osai/passkey/enrollment/options`
- `POST /api/osai/passkey/enrollment/verify`
- `GET /api/osai/passkey/credentials`
- `PATCH|DELETE /api/osai/passkey/credentials/:credential_ref`

The website API routes are same-origin, non-caching proxies. They filter upstream results to the browser-safe contract and return generic failures. Administrator requests forward the Google ID token supplied by Google Identity Services. The website does not verify that token or maintain an administrator allowlist; Sophia verifies the token audience against `OSAI_GOOGLE_OAUTH_CLIENT_ID`, requires a Google-verified email, and checks `OSAI_PASSKEY_ADMIN_EMAILS`.

The ID token is retained only in React memory for the current page lifetime. It is not written to cookies, local storage, session storage, analytics, or logs. No OAuth client secret exists in browser or website code.

## Confirmed administrator API schema

- `POST /api/osai/passkey/enrollment/options` accepts `{ "label": "<safe device label>" }`. Sophia stores the label with the short-lived registration challenge and returns both an opaque `registration_transaction` and `public_key_options`. The website forwards only those two response fields to the browser. Sophia derives the administrator identity exclusively from the verified Google ID token; the website never submits a name, email, identity ID, or role.
- `POST /api/osai/passkey/enrollment/verify` accepts `{ "registration_transaction": "<opaque server value>", "credential": {} }`. The label is not accepted at verification time. The browser retains the transaction only for the active in-memory registration ceremony, and the website proxy forwards the transaction and credential without logging or persisting either value.
- `GET /api/osai/passkey/credentials` returns only `administrator.display_name` and `credentials[]` entries containing `credential_ref`, `label`, `created_at`, and nullable `last_used_at`.
- The credential-list response does not contain email, identity ID, public-key material, credential ID, or role. The website filters the response again before returning it to the browser.

## WebAuthn requirements owned by Sophia

- Relying Party name: `Orbit Systems AI`
- Production Relying Party ID: `orbitsystems.ai`
- Expected production origin: `https://orbitsystems.ai`
- User verification: `required`
- Discoverable credential: `required`
- Attestation: `none`
- Cryptographically random, short-lived, single-use server challenges
- Validation authorization bound to caller, active call, action, tenant, environment, and expiration

The website uses `@simplewebauthn/browser` only to invoke native browser WebAuthn ceremonies. It does not implement cryptographic verification.

## Security and privacy controls

- Exact production-origin validation on every mutation; development permits only `http://localhost:3003`.
- Strict Content Security Policy, frame denial, no-referrer policy, disabled camera/microphone/geolocation, and non-caching responses.
- No marketing navigation, Tawk widget, advertising, analytics replay, keystroke capture, or third-party forms on either page.
- No session code, challenge, credential payload, Google token, caller record, personal identifier, role record, demo information, or internal path is logged by website code.
- Browser responses are limited to the documented action label, opaque validation transaction, WebAuthn options, explicit generic status, safe credential reference, label, creation date, last-used date, and safe authenticated display name.
- Failed or malformed upstream responses fail closed. Only an explicit `status: validated` produces success.
- Website mutations fail closed unless the environment, relying-party ID, and expected origin form one exact approved tuple; development and production values cannot be mixed.
- Production feature flags remain owned by Sophia and unchanged: `OSAI_PASSKEY_ENABLED=FALSE` and `OSAI_PASSKEY_WEBSITE_READY=FALSE` until joint activation.

## Website configuration

- `SOPHIA_API_BASE_URL` — environment-specific Sophia API base URL; server-side only.
- `OSAI_PASSKEY_ENVIRONMENT` — exactly `development` or `production`.
- `OSAI_WEBAUTHN_RP_ID` — exactly `localhost` in development or `orbitsystems.ai` in production.
- `OSAI_WEBAUTHN_EXPECTED_ORIGIN` — exactly `http://localhost:3003` in development or `https://orbitsystems.ai` in production.
- `OSAI_GOOGLE_OAUTH_CLIENT_ID` — Google OAuth web client ID; supplied by the server to the administrator page, public by design, with exact authorized JavaScript origins.

The intended production value is `872000798632-ntq8c3ptafl2v9n9n5d5vdilsfmi2vmd.apps.googleusercontent.com`. It belongs to the `orbit-ai-receptionist-dev` Google Cloud project and is configured with exactly one authorized JavaScript origin: `https://orbitsystems.ai`. It has no redirect URIs. Its generated client secret is neither needed nor permitted in the website because Google Identity Services uses the public client ID.

Localhost was intentionally omitted from this production client. Local Google sign-in and real development passkey enrollment therefore require a separate development OAuth web client authorized only for `http://localhost:3003`; the production client must not be reused or broadened for local testing.

Approved tuples:

| Environment | RP ID | Expected origin |
|---|---|---|
| Development | `localhost` | `http://localhost:3003` |
| Production | `orbitsystems.ai` | `https://orbitsystems.ai` |

The website and Sophia deployments must select the same tuple. Development challenges, validation transactions, credentials, and Google OAuth configuration are not production fixtures and cannot be promoted.

No Sophia API token, Google OAuth client secret, role-lookup pepper, administrator identity, or caller identity is required or permitted in website source.

## Google Cloud and Sophia coordination

Before non-production joint testing, the Sophia project must provide:

1. The non-production API base URL. The administrator enrollment-options request and credential-list response schemas are confirmed above; any remaining validation, verification, rename, and revocation schema changes must be coordinated before connection.
2. CORS/origin policy permitting only the agreed OSai origins.
3. A separate development Google OAuth web client ID configured for `http://localhost:3003`. The production client and its sole `https://orbitsystems.ai` origin are already recorded above. No redirect URI is required by the current Google Identity Services callback flow unless Sophia selects a redirect-based flow later.
4. Backend verification of Google token signature, issuer, audience, expiration, verified email, and `OSAI_PASSKEY_ADMIN_EMAILS` membership.
5. Firestore challenge, credential, validation-session, lockout, rate-limit, audit, and single-use authorization implementation. Development records remain under `passkey_validation_development`; production records remain under `passkey_validation_production`.
6. Confirmation of the required WebAuthn settings above.
7. A backend-only `OSAI_ROLE_LOOKUP_PEPPER` in the existing secret manager. Sophia also uses it to protect rate-limit keys; the website never receives or derives those keys.
8. Safe backend audit events that record the minimum event type, result, environment, and non-sensitive correlation references needed for investigation without recording caller data, codes, challenges, credential payloads, tokens, or protected-resource details.

Existing Google Cloud, Firestore, website hosting, and network traffic may incur their ordinary usage-based charges. This website implementation adds no fixed monthly service, vendor, database, subdomain, or hosting product.

## Local verification status

- Production Next.js build: passed locally.
- ESLint: passed with no errors; existing unrelated warnings remain.
- Automated contract/security suite: validates both approved environment tuples, rejects mixed environment settings, enforces exact origins, filters generic statuses and credential metadata, checks non-caching headers, validates the proxy contract and Google bearer-token forwarding, and confirms unauthenticated and cross-origin denial.
- Responsive public page: locally verified at desktop and mobile dimensions.
- Real WebAuthn registration/authentication, revoked-credential rejection, replay prevention, three-attempt lockout, and Safari acceptance require Sophia's non-production endpoints and real devices.

## Deployment status

Not deployed. No production commit or release date exists for this feature. Production administrator records and passkeys have not been provisioned, production feature flags have not been changed, and the website has not been connected to Sophia production.
