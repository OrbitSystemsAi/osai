# Authentication Implementation

## Outcome

The website now provides an invite-oriented Neon Auth client flow for sign-in, invitation account creation, email verification guidance, password recovery, session checking, and sign-out.

Account creation and email-code verification use Neon Auth's native Better Auth endpoints so signup can succeed before a verified session exists. The remaining client operations use the Supabase-compatible adapter.
If an earlier signup already created the user, a repeated invitation submission continues to email verification instead of surfacing an SDK exception.

## Routes

- `/auth/sign-in` — email and password sign-in
- `/auth/invitation` — account creation for an invited email identity
- `/auth/verify-email` — six-digit email verification code after account creation
- `/auth/forgot-password` — non-enumerating recovery request
- `/member/*` — client session gate before the existing member hub is rendered

## Configuration

Set `NEXT_PUBLIC_NEON_AUTH_URL` to the branch-specific Neon Auth URL. The checked-in `.env.example` documents the expected value. When it is absent, the client uses the OSai main-branch Neon Auth endpoint as its default.

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
