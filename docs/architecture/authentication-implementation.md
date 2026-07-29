# Authentication Implementation

## Outcome

The public website now exposes an **Account** navigation control with separate **Sign in** and **Create Account** actions. Each action opens a compact modal without leaving the landing page. Sign-in includes username/email, password, and password-recovery access. Account creation includes full name, email, password, and password confirmation.

As a temporary operating configuration, Neon Auth's **Verify at Sign-up** setting is disabled. Account creation uses Neon Auth's native Better Auth endpoint and then establishes a password session without an email-code step. If an earlier signup already created the user, the invitation flow returns the user to sign-in with their email prefilled.

Successful sign-in or account creation routes to `/member/dashboard`, the current OSai account home. Password confirmation is validated in the browser before the Neon account-creation request is sent.

This is an implementation deviation from the approved access-request flow in `docs/access/access-request-and-approval.md`. Administrator approval remains mandatory, and email verification should be restored before the protected hub is used for confidential materials.

## Routes

- `/auth/sign-in` — email and password sign-in
- `/auth/invitation` — account creation for an invited email identity
- `/auth/forgot-password` — non-enumerating recovery request
- `/member/*` — client session gate before the existing member hub is rendered

## Configuration

Set `NEXT_PUBLIC_NEON_AUTH_URL` to the branch-specific Neon Auth URL. The checked-in `.env.example` documents the expected value. When it is absent, the client uses the OSai main-branch Neon Auth endpoint as its default.

The main branch's Neon Auth trusted domains include `https://osai-pink.vercel.app` and `https://osai-orbit-systems-ai.vercel.app`. Add any future production or preview hostname before using browser-based authentication from that origin.

## Security boundary

This repository is now a Next.js App Router application. The current client session gate improves the user flow but is not sufficient authorization for protected content. Before any confidential member data or media is connected, implement server-side authorization that:

- validates the Neon session on every protected request;
- links application records to the immutable Neon Auth user ID;
- evaluates OSai membership approval, agreement status, project membership, and beta assignment;
- returns protected data only after that server-side decision;
- records auditable access and lifecycle events.

Authentication proves identity. It does not itself grant OSai membership or project access.

## Verification

- Production Next.js build
- Desktop sign-in route inspection at 1440 × 1000
- Responsive invitation route inspection at the mobile breakpoint
- Route and accessible-name inspection for all primary controls
- Missing-configuration and unauthenticated member-route behavior

## Application roles and project administration

Application authorization is stored in `user_profiles`, keyed by the immutable Neon Auth user ID. Roles are `member` or `admin`; the role is never read from client-editable profile metadata. Admin-only API routes revalidate the Neon session and role on every request.

To initialize the first administrator, set `DATABASE_URL`, apply the SQL files in `db/migrations` in numeric order, and put that person's immutable Neon Auth user ID in `OSAI_BOOTSTRAP_ADMIN_USER_IDS`. After the profile signs in, the bootstrap rule creates or promotes its application profile. That administrator can then use **Users** to grant or remove administrator rights for other application profiles.

Administrators can use **Manage Projects** to add, edit, publish, archive, and remove projects. Project and role mutations are recorded in `audit_events`. A user cannot remove their own administrator role through the UI/API, reducing accidental lockout risk.
