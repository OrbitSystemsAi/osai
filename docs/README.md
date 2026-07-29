# OSai Product and Experience Documentation

This directory is the canonical reference for the Orbit Systems / OSai website experience. Future OSai chats and implementation tasks should begin here, then load only the document relevant to the work being performed.

## Document map

| Document | Use it for |
|---|---|
| [Website information architecture](architecture/website-information-architecture.md) | Pages, navigation menus, CTAs, and movement between public, member, project, beta, and admin areas |
| [Authentication implementation](architecture/authentication-implementation.md) | Current Neon Auth client routes, configuration, verification, and required server authorization boundary |
| [Administrator authorization](architecture/admin-authorization.md) | Application roles, first-admin bootstrap, role management, and admin-only project mutations |
| [DocuSign integration](architecture/docusign-integration.md) | General NDA template setup, embedded signing, envelope status, credentials, and production security boundary |
| [Access request and approval flow](access/access-request-and-approval.md) | Neon-backed identity setup, email validation, pending approval, administrative decisions, and confirmation messages |
| [Lifecycle tracking and nudges](operations/lifecycle-tracking-and-nudges.md) | Admin lifecycle tracking, stalled-state detection, reminders, escalation, and audit requirements |
| [Canonical lifecycle statuses](reference/lifecycle-statuses.md) | Shared state names, meanings, allowed transitions, responsible parties, and terminal states |
| [Foundation roadmap](../FOUNDATION_ROADMAP.md) | Product vision, access model, architecture, delivery phases, security, and scope guardrails |

## Reading order by task

### Public website or navigation work

1. Website information architecture
2. Foundation roadmap sections 1–4

### Account onboarding or Neon integration

1. Access request and approval flow
2. Canonical lifecycle statuses
3. Foundation roadmap sections 4–5 and 9

### Agreements or DocuSign integration

1. DocuSign integration
2. Authentication implementation
3. Canonical lifecycle statuses
4. Foundation roadmap sections 4–6 and 9

### Admin dashboard work

1. Lifecycle tracking and nudges
2. Access request and approval flow
3. Canonical lifecycle statuses

### Project room or beta work

1. Website information architecture
2. Lifecycle tracking and nudges
3. Foundation roadmap sections 6–7

## Documentation conventions

- Mermaid diagrams are source-of-truth flow diagrams and should remain editable.
- Status identifiers use `snake_case` and must be reused consistently in UI, APIs, database records, jobs, and audit events.
- Page and CTA labels use title or sentence case and represent recommended visible copy.
- Authentication does not equal authorization. A verified Neon identity never grants protected OSai access by itself.
- Access decisions and reminders must produce auditable events.
- Project-level access remains distinct from general OSai membership.

## Ownership

These documents describe product behavior, not final legal language. NDA, electronic-signature, privacy, retention, and investment-related decisions require review by the appropriate Orbit Systems owner and qualified counsel.
