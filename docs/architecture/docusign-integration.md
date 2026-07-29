# DocuSign Agreement Integration

## Outcome

The member Agreements page now supports a DocuSign developer-account flow for the General NDA. A signed-in member can start an embedded signing ceremony from a DocuSign template and OSai re-queries the envelope after DocuSign returns the member to `/member/agreements`.

The current implementation is a sandbox integration slice. It does **not** create a production access grant. Envelope identity is held in a signed, HTTP-only cookie until the application-owned Neon agreement tables, webhook audit trail, and administrator approval records are implemented.

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
- `/member/agreements?docusign=returned` — return location after the signing ceremony; the page refreshes status from DocuSign.

## Security and persistence boundary

- DocuSign secrets are server-only and never use the `NEXT_PUBLIC_` prefix.
- The signer name, email, and immutable Neon Auth user ID come from the validated server session.
- The signed cookie prevents a member from substituting an envelope identifier, but it is not the durable system of record required by the foundation roadmap.
- Before confidential content is enabled, add application-owned `AgreementEnvelope`, `AccessGrant`, and `AuditEvent` records; validate DocuSign Connect HMAC signatures; process events idempotently; reconcile envelopes periodically; and grant access only after a verified completion event commits.
- The current client-side member route gate must also be replaced with server-side page authorization before protected data is rendered.

## Verification states

The UI uses canonical lifecycle identifiers:

- `general_nda_pending` — no envelope has been created.
- `general_nda_sent` — an envelope exists but DocuSign does not report completion.
- `general_nda_signed` — DocuSign reports the envelope as completed.
- `general_nda_expired` — the envelope was voided and a new request is required.
