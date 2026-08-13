# Authentication Implementation

## Provider and site boundary

OSai uses a dedicated Clerk application named `osai-auth` for `orbitsystems.ai`. Neon remains the application database but does not establish browser sessions.

This Clerk application is connected only to the Vercel project `osai`. Consulting and future Orbit Systems products use separate Clerk applications. Creating an account on one site does not create an account on, or grant access to, another site.

## Routes

- `/auth/sign-in` — Clerk sign-in and account recovery
- `/auth/invitation` — Clerk account creation
- `/member/*` — authenticated member experience

The public account controls hand off to these Clerk-hosted components. Clerk owns password collection, verification, recovery, and session cookies.

## Configuration

The Vercel Clerk Marketplace integration supplies:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

`ClerkProvider` wraps the App Router tree and `proxy.ts` establishes Clerk request context. Protected APIs call Clerk server helpers and never trust client-supplied identity data.

## Authorization and migrated profiles

Authentication proves identity; it does not grant OSai membership, administrator rights, legal completion, project membership, or beta access. Those decisions remain in Neon Postgres.

Application authorization is keyed by the immutable ID already stored in `user_profiles`. On a migrated user's first Clerk session, the server checks the Clerk ID and then performs a one-time reconciliation using the verified primary email. This preserves the existing profile ID and therefore preserves roles, agreements, project assignments, and audit relationships. Subsequent authorization uses the stored immutable profile ID, not email. New users are keyed by their Clerk user ID.

Existing members must create a Clerk account with the same email address they previously used. Their previous authentication password is not transferable. Clerk verification confirms control of that address before the existing OSai profile is reconciled.

## Server boundary

Every protected page mutation and API route must:

1. validate the Clerk session server-side;
2. resolve the corresponding OSai application profile;
3. evaluate application role, agreement status, project membership, and beta assignment;
4. return data only after authorization succeeds; and
5. record required audit events against the immutable application profile ID.

Roles are `member` and `admin`; roles never come from client-editable Clerk metadata. Admin-only APIs revalidate both the Clerk session and application role on every request.

To bootstrap the first administrator, set `OSAI_BOOTSTRAP_ADMIN_USER_IDS` to the immutable Clerk/application identity ID, never an email address. After the profile signs in, administrators can manage subsequent roles through **Users**.

## Verification

- Run lint and a production Next.js build.
- Verify `/auth/sign-in` and `/auth/invitation` on the production domain.
- Verify an unauthenticated `/member/*` visit is gated.
- Verify a migrated email resolves to its existing role and projects.
- Verify an account created on another Orbit Systems site cannot silently authenticate here.
