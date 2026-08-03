# DocuSign Agreement Integration

## Outcome

The member Legal page now supports a DocuSign developer-account flow for the General Mutual Non-Disclosure Agreement (General MNDA). A signed-in member can start an embedded signing ceremony from a DocuSign template and OSai re-queries the envelope after DocuSign returns the member to `/member/legal`.

The current implementation is a sandbox integration slice. It does **not** create a production access grant. Envelope identity is retained in the application-owned `agreement_envelopes` table and in a signed, HTTP-only member cookie. Webhook processing, the complete audit trail, and final administrator approval records remain future work.

For the current test flow, a verified completed General MNDA sandbox envelope is a prerequisite for a non-administrator to open or download any project legal document. Administrators retain their documented legal-management bypass. Sandbox completion unlocks only the test legal-document sequence; it does not create real project access or satisfy a production agreement requirement.

## DocuSign developer-account setup

1. In DocuSign Apps and Keys, create or select an integration key.
2. Add an RSA keypair and place the private key only in the server environment.
3. Create a General NDA template. Add one recipient role named `Signer` (or set `DOCUSIGN_SIGNER_ROLE` to the exact role name).
4. Record the API Account ID, API Username/User ID, integration key, and template ID in the environment variables documented in `.env.example`.
5. Grant the API user one-time JWT consent for the `signature impersonation` scopes. The redirect URI used during consent must be registered on the integration key.
6. Use the demo hosts for a developer account. Production hosts require DocuSign go-live approval and a production account.

## Routes

- `GET /api/agreements` — validates the Neon session and returns the current DocuSign envelope state.
- `POST /api/agreements/sign` — validates the Neon session, creates a template envelope, creates its recipient view, and returns the DocuSign signing URL.
- `/member/legal?docusign=returned` — return location after the signing ceremony; the page refreshes status from DocuSign.

## Security and persistence boundary

- DocuSign secrets are server-only and never use the `NEXT_PUBLIC_` prefix.
- The signer name, email, and immutable Neon Auth user ID come from the validated server session.
- The signed cookie prevents a member from substituting an envelope identifier. `agreement_envelopes` provides the durable member-to-envelope record used by the administrator directory and member status reconciliation.
- Before confidential content is enabled, add `AccessGrant` records and the complete agreement `AuditEvent` workflow; validate DocuSign Connect HMAC signatures; process events idempotently; reconcile envelopes periodically; and grant access only after a verified completion event commits.
- Demo/sandbox envelope completion remains test-only. Only a completed production General MNDA may advance the administrator directory beyond **Site Member / Pending MNDA**.
- The current client-side member route gate must also be replaced with server-side page authorization before protected data is rendered.

## Verification states

The UI uses canonical lifecycle identifiers:

- `general_nda_pending` — no envelope has been created.
- `general_nda_sent` — an envelope exists but DocuSign does not report completion.
- `general_nda_signed` — DocuSign reports the envelope as completed.
- `general_nda_expired` — the envelope was voided and a new request is required.
