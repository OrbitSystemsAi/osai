# Orbit Systems / OSai Hub — Foundation Roadmap

## 1. Product vision

Orbit Systems is the trusted home for the OSai portfolio: a private-to-public hub where people can discover projects, establish a legal relationship with Orbit Systems, access protected project materials, participate in beta programs, and eventually explore compliant investment opportunities.

The first audience is family, friends, trusted collaborators, and early supporters. The experience should feel personal and inviting while establishing clear consent, confidentiality, access control, and an auditable record from the beginning.

## 2. Product principles

1. **Trust before access.** Explain why information is protected, what a person is signing, and what access it grants.
2. **Progressive disclosure.** Public visitors see enough to understand OSai; signed-in and NDA-cleared users see increasingly sensitive project information.
3. **One relationship, explicit project access.** A General NDA covers initial OSai conversations. Projects may require a separate project NDA or acknowledgement.
4. **Portfolio, not monolith.** Each project can become its own site or application while Orbit Systems remains the identity, access, portfolio, and feedback intelligence hub.
5. **Human-readable consent.** Legal status, document version, signature date, and access level should always be visible to the user.
6. **Evidence over vanity metrics.** Beta feedback and funding interest should be analyzed as product signals, not presented as hype.
7. **Investment comes later.** Interest collection can be explored early, but actual investment workflows begin only after legal and regulatory design.

## 3. Core user journey

### Visitor

1. Arrives at the Orbit Systems home page.
2. Learns what Orbit Systems and OSai are.
3. Views public project cards with a short problem statement, status, and access label.
4. Receives an invitation or requests access.

### Trusted member

1. Creates an account and verifies their email.
2. Reviews and signs the current General NDA through DocuSign.
3. Returns to an OSai dashboard showing NDA status and available projects.
4. Opens a project and sees its public or General-NDA-level overview.
5. If required, signs or accepts the project-specific agreement.
6. Gains access to protected videos, pitch deck, milestones, funding progress, beta invitations, and updates.

### Beta participant

1. Accepts a beta invitation for a specific project.
2. Uses the project's site or application with a consistent OSai feedback layer.
3. Submits ratings, comments, bug reports, feature ideas, and optional screenshots or session context.
4. Sees acknowledgement and, where appropriate, the status of their feedback.

### OSai administrator

1. Manages people, invitations, roles, NDA templates, projects, and access policies.
2. Publishes and versions protected project materials.
3. Reviews signature and access audit trails.
4. Monitors beta feedback across projects.
5. Uses summarized themes and trends while retaining links to the original feedback.

## 4. Access model

Use explicit access levels rather than a single private/public switch.

| Level | Example content | Requirement |
|---|---|---|
| Public | OSai story, project teaser, status | None |
| Member | Personal dashboard, general updates | Verified account |
| General NDA | Initial concepts and conversations | Executed current General NDA |
| Project NDA | Detailed project materials | Project access plus required agreement |
| Beta | Test build, feedback tools, release notes | Beta assignment |
| Internal | Unpublished materials and raw analysis | Staff/admin role |

Access should be derived from durable records: user identity, role, invitation, agreement version and status, project membership, and beta assignment. Do not rely only on a URL being difficult to discover.

## 5. Foundation architecture

### Hub responsibilities

- Neon Auth integration, application profiles, invitations, roles, and account recovery
- General and project-specific agreement orchestration
- Project catalog, access policy, and protected content
- Beta program registry and cross-project feedback analysis
- Notifications, audit logs, and administrative controls
- Future expressions of investment interest

### Project responsibilities

- The project's primary user experience and domain logic
- Project-specific analytics and operational data
- A lightweight OSai beta SDK or API integration
- Secure links back to the hub for identity, access, and participant context

### Recommended boundaries

- **Web application:** responsive hub with a public surface and authenticated portal
- **Authentication:** Neon Auth for sign-up, sign-in, email verification, sessions, and account recovery; protected pages and APIs must validate the Neon session server-side
- **Backend/API:** server-side authorization for every protected resource
- **Relational database:** Neon Postgres for application profiles, projects, access grants, agreements, content, beta programs, feedback, and audit events; Neon Auth data remains in its dedicated `neon_auth` schema
- **Object storage:** decks, thumbnails, feedback attachments, and other files
- **Video provider:** private playback using signed or expiring access rather than public video URLs
- **DocuSign integration:** embedded or remote signing, Connect webhooks, envelope reconciliation, and signed-document retention policy
- **Analytics:** privacy-conscious product analytics separated from the legal audit trail
- **Background jobs:** webhook processing, email, media processing, feedback summarization, and reconciliation

## 6. Foundational domain model

- **AuthUser** — Neon Auth-owned identity, credentials, verification, and sessions
- **UserProfile** — Orbit Systems-owned profile linked to the immutable Neon Auth user ID; never use email as the relational key
- **Organization** — Orbit Systems initially; supports future partners or ventures
- **Project** — portfolio entry, stage, visibility, and access policy
- **ProjectMembership** — a user's role and access state for a project
- **AgreementTemplate** — General NDA or project agreement with a version and effective date
- **AgreementEnvelope** — DocuSign envelope, recipient, status, timestamps, and provider references
- **AccessGrant** — the resulting permission, its source, and any expiration or revocation
- **ContentItem** — video, deck, update, milestone, or funding-progress item with an access level
- **BetaProgram** — project, cohort, dates, build, and participation state
- **Feedback** — category, severity, sentiment, source, build, user context, and consent-safe metadata
- **FeedbackTheme** — an analyzed cluster that links back to its source feedback
- **AuditEvent** — security- and agreement-relevant activity
- **InterestExpression** — non-binding future investment interest, kept distinct from an offering or transaction

## 7. Delivery roadmap

### Phase 0 — Decisions, trust, and legal foundation

**Goal:** remove ambiguity before building irreversible flows.

- Define the Orbit Systems and OSai brand relationship in one paragraph.
- Identify the legal entity that owns projects and signs agreements.
- Have counsel prepare or approve the General NDA and determine when a project-specific NDA is needed.
- Define invitation policy, age eligibility, geographic limits, privacy notice, terms, retention, deletion, and incident-response expectations.
- Choose whether the MVP is invite-only or allows access requests. Invite-only is recommended for the initial circle.
- Classify project information and define what belongs at each access level.
- Define success measures and a small initial project set.

**Exit criteria:** approved document templates, access matrix, data inventory, initial project content, and named product/legal owners.

### Phase 1 — Trust-first hub MVP

**Goal:** safely onboard a trusted person, obtain the General NDA, and reveal appropriate project content.

- Public home, OSai story, portfolio teaser, privacy notice, and terms
- Invitation-based account creation, email verification, login, sessions, and recovery through Neon Auth
- Member dashboard with agreement and project-access status
- DocuSign General NDA flow with a clear pre-sign explanation
- Webhook-driven agreement status plus periodic reconciliation
- Project catalog and protected project detail pages
- Admin tools for invitations, people, projects, access, and agreement status
- A server-side authorization layer that combines the Neon Auth user ID with Orbit Systems roles, NDA status, project membership, and beta assignment
- Immutable audit events for signature, grant, revocation, and protected-content access
- Baseline accessibility, responsive design, security headers, rate limiting, backups, monitoring, and error reporting

**Exit criteria:** a new invitee can independently sign, return, access authorized content, and be denied unauthorized content; administrators can explain every access decision from the audit trail.

### Phase 2 — Rich project rooms

**Goal:** make each protected project page useful enough to sustain an ongoing supporter relationship.

- Project-specific NDA or acknowledgement when required
- Private intro videos and pitch decks
- Milestones, changelog, founder updates, FAQs, and project stage
- Funding progress presented with source, timestamp, and a clear definition of what the number represents
- Watch/follow controls and project notifications
- Content versioning and preview-before-publish workflow
- Optional watermarking or viewer identification for highly sensitive materials

**Exit criteria:** at least two projects can independently configure access and publish protected, versioned updates.

### Phase 3 — Federated beta testing layer

**Goal:** collect consistent, actionable feedback from independently deployed OSai products.

- Reusable beta widget/SDK with project key, environment, build, and user pseudonymous identifier
- Feedback modes: general reaction, bug, feature idea, friction point, and guided survey
- Optional screenshot and technical context with explicit consent and redaction controls
- Beta cohort, invitation, release-note, and participant management
- Feedback inbox with assignment, status, priority, duplicate linking, and administrator notes
- Per-project and portfolio-level dashboards
- Theme clustering and summaries that always link to source feedback
- Data-quality controls and deletion/export workflows

**Exit criteria:** one external OSai application sends feedback into the hub end to end, and a product decision can be traced from a theme to original submissions.

### Phase 4 — Portfolio intelligence

**Goal:** turn activity across projects into evidence for prioritization.

- Cross-project taxonomy for problem type, audience, experiment, feature, and outcome
- Trends by cohort, build, release, project, and time period
- Qualitative theme evolution, emerging issues, and unresolved critical feedback
- Founder briefing generated from verified hub data with citations to source records
- Project health scorecard combining adoption, engagement, feedback, delivery, and manually verified business metrics
- Role-limited export and sharing controls

**Exit criteria:** a recurring portfolio review can be run from the hub without manually assembling data from each project.

### Phase 5 — Investment readiness, then regulated execution

**Goal:** evaluate demand without accidentally presenting a securities offering.

**Readiness stage:**

- Educational project and traction information
- Clearly labeled, non-binding expressions of interest
- Eligibility and jurisdiction questions designed with counsel
- Investor-relations data room with stronger access and audit controls
- Cap-table and reporting requirements mapped before selecting vendors

**Execution stage, only after securities counsel approval:**

- Select the offering structure, exemption, intermediary, disclosures, eligibility checks, KYC/AML, payment/custody, tax reporting, transfer restrictions, and ongoing investor communications
- Prefer an appropriately regulated funding/investment provider over building transaction infrastructure in the hub
- Keep legal offering records separate from marketing metrics and beta feedback

**Exit criteria:** counsel-approved offering design and a compliant provider architecture; no investment acceptance before this point.

## 8. MVP scope guardrails

### Include

- Invite-only membership
- One General NDA template and status flow
- A small portfolio catalog
- Protected video/deck/update content
- Essential admin and audit capabilities
- Instrumentation needed to learn from onboarding and access failures

### Defer

- Social network or community feed
- Complex organization/team accounts
- Native mobile applications
- Automated investor transactions
- Elaborate AI recommendations
- Full project-management tooling
- A universal beta SDK before the first hub journey is stable

## 9. Security, privacy, and legal checklist

- Server-side authorization and least-privilege administrator roles
- Neon Auth session validation on every protected page, API route, media grant, and mutation; UI visibility is never treated as authorization
- Multi-factor authentication for administrators when supported by the selected Neon Auth configuration; passkeys or MFA option for members
- Separate Neon branches for development, preview, and production; verify that branched auth data and application data follow the intended test-data policy
- Encryption in transit and at rest; secrets stored outside source control
- DocuSign webhook signature validation, idempotency, replay protection, and reconciliation
- Agreement-version history and preservation of completion certificates/provider references
- Signed or expiring URLs for protected files and video
- Audit-log protection, retention schedule, backup restore tests, and breach-response runbook
- Data minimization for screenshots, device data, session context, and AI analysis
- Clear notice when feedback may be analyzed by AI; preserve originals and allow human correction
- Terms covering beta instability, confidential materials, acceptable use, and feedback/IP treatment
- Counsel review for NDA enforceability, electronic signatures, privacy, IP, and any investment-related language

This roadmap is a product and technical plan, not legal advice. NDA, electronic-signature, privacy, and securities decisions require qualified counsel in the relevant jurisdictions.

## 10. Initial success measures

- Invitation-to-verified-account completion rate
- Verified-account-to-executed-General-NDA completion rate
- Median time from invitation to authorized project access
- Signing failures, webhook discrepancies, and incorrect-access incidents
- Project follows, protected-content completion, and return visits
- Beta invitation acceptance and useful-feedback rate
- Time from feedback submission to triage and to resolution/decision
- Percentage of generated themes that retain valid links to source evidence
- Qualitative trust score from short onboarding interviews

The MVP should optimize first for **correct access, comprehensible consent, and trusted participation**, not raw registration volume.

## 11. First 30 days

### Week 1 — Product definition

- Write the one-sentence promise and audience definition.
- Select 2–3 representative projects and classify their content.
- Confirm the legal entity, NDA owner, initial jurisdictions, and counsel workflow.
- Draft the access matrix and member journey.

### Week 2 — Experience and data design

- Create low-fidelity flows for invitation, sign-up, NDA, dashboard, project room, and admin review.
- Finalize the initial domain model and audit-event list.
- Inventory video, deck, copy, imagery, milestones, and funding-progress definitions.
- Establish naming, status, and project-stage conventions.

### Week 3 — Technical spike

- Validate DocuSign development-account flow, embedded versus email signing, webhooks, and reconciliation.
- Prototype protected content authorization and expiring media access.
- Establish Neon Postgres and Neon Auth branches/configuration for development, preview, and production, plus storage, email, monitoring, and deployment environments.
- Prototype the Neon Auth invitation, email-verification, server-session, recovery, and user-profile linking flows.
- Define the threat model and test strategy.

### Week 4 — Build-ready baseline

- Approve MVP wireframes and acceptance criteria.
- Break Phase 1 into independently testable delivery slices.
- Seed the first projects and content in a non-production environment.
- Run a tabletop walkthrough with 3–5 trusted users before implementation accelerates.

## 12. Decisions to make next

1. What is the one-sentence promise of Orbit Systems to a trusted invitee?
2. Is Orbit Systems the legal entity and OSai the AI/portfolio brand, or is the relationship different?
3. Which 2–3 projects should prove the model first?
4. Is the General NDA sufficient for any early project, or will one pilot require a project NDA?
5. Should signing happen embedded in the hub or through DocuSign email? The roadmap supports either; embedded signing offers the smoothest guided journey.
6. Who may invite users and grant project access during the pilot?
7. Which project information is safe before the General NDA?
8. What does “funding progress” mean for each project: founder capital, commitments, grants, revenue, or another verified measure?
9. What single beta-feedback question would be valuable across every OSai product?
10. What should a trusted user feel after their first visit: intrigued, included, protected, inspired, or something else?
