# OSai Shared Agent Instructions

## Shared Project Structure

Before creating or reorganizing project documentation, read and follow `/Users/earlpowery/Development/PROJECT_STRUCTURE.md`. Project-specific instructions may extend that standard; document any intentional exception in this file.

This file is the common operating brief for every AI chat or coding agent working on the Orbit Systems / OSai website and platform. Read it before planning, writing, designing, coding, or reviewing work in this repository.

## 0. Canonical workspace root

The canonical root folder for the OSai website and shared product documentation is:

`/Users/earlpowery/Development/osai`

Unless a path is explicitly absolute or a task identifies another project repository, resolve all paths in this document relative to that root. Start OSai website tasks with `/Users/earlpowery/Development/osai` opened as the workspace so this `AGENTS.md` file is discovered automatically.

This file governs the OSai root and every nested directory beneath it. A more deeply nested `AGENTS.md` may add project-specific instructions; where instructions conflict, the closest applicable `AGENTS.md` governs that project while the shared business, legal, privacy, and security principles here continue to apply.

An OSai project stored outside `/Users/earlpowery/Development/osai` will not inherit this file automatically. That project must include its own `AGENTS.md` that references these shared instructions, or the task must explicitly instruct the agent to read this file before working.

## 1. Product context

OSai is a business. The public website must first explain and sell OSai's services, establish credibility, and convert qualified visitors into conversations or service inquiries.

Orbit Systems is also the home of the broader OSai portfolio. Its authenticated hub supports trusted members, General NDA signing, protected project rooms, project-specific agreements, pitch materials, beta programs, portfolio feedback analysis, and—only in a legally compliant future phase—investment-related experiences.

Do not allow the portfolio hub to obscure the public site's primary commercial purpose.

## 2. Required startup review

Before doing substantive work, inspect the repository and read the current source material relevant to the task. At minimum:

1. Read `FOUNDATION_ROADMAP.md` in full.
2. Read any additional foundation, vision, strategy, requirements, brand, voice, audience, service, or positioning documents.
3. Review all relevant website process flow charts.
4. Review all relevant website page flow charts, sitemap, information architecture, and navigation diagrams.
5. Review relevant wireframes, mockups, visual references, design-system files, content inventories, and approved assets.
6. Review relevant technical architecture, data model, authentication, authorization, NDA/DocuSign, security, privacy, beta-feedback, analytics, deployment, and integration documentation.
7. Inspect the existing implementation and tests before proposing or making changes.

Use `rg --files` to discover repository material. Do not assume a document does not exist because it is not linked from this file.

If a required reference is missing, continue safely using the current foundation documents and clearly identify the missing artifact or decision. Do not invent approved business, legal, brand, or UX requirements.

## 3. Source-of-truth priority

When instructions conflict, use this order:

1. The user's current, explicit direction
2. Approved legal, security, privacy, and compliance requirements
3. Approved foundation and product strategy documents
4. Approved process flows, page flows, sitemap, wireframes, and design system
5. Technical architecture and implementation documentation
6. Existing implementation patterns
7. Reasonable assumptions, stated explicitly

Flag material conflicts instead of silently choosing whichever reference is easiest to implement.

## 4. Experience model

Treat OSai as two connected experiences:

### Public business website

Primary goals:

- Communicate what OSai does and who it serves
- Present services, outcomes, differentiators, proof, and a credible point of view
- Build trust in OSai as a business
- Convert qualified visitors through a clear call to action
- Offer selected public portfolio evidence when it strengthens the service proposition

### Secure portfolio hub

Primary goals:

- Authenticate users through the dedicated OSai Clerk application
- Track application profiles and business data in Neon Postgres
- Orchestrate the General NDA and project agreements through DocuSign
- Apply server-side, agreement-aware project authorization
- Provide protected project videos, decks, progress, updates, and beta access
- Collect and analyze beta feedback across OSai sites and applications
- Prepare for future investment-readiness work without presenting an unauthorized securities offering

Public visitors must not be forced through portfolio or NDA concepts merely to understand or inquire about OSai's services. An NDA is an access boundary for confidential conversations or materials, not the default public conversion step unless the approved customer journey explicitly requires it.

## 5. Planning and implementation rules

- Begin with the user, business objective, and intended conversion or task outcome.
- Trace proposed pages and features through the approved process and page flows.
- Preserve clear boundaries between public, member, General NDA, project NDA, beta, and internal access levels.
- Validate authorization on the server for every protected route, mutation, file, video, and API response.
- Use the immutable application profile ID to relate an authenticated identity to OSai application data; email is permitted only for one-time verified migration reconciliation, never as the ongoing relational key.
- Treat DocuSign as the agreement system of record while retaining the application records needed for access decisions, reconciliation, and auditability.
- Keep AI-generated feedback summaries traceable to original submissions and subject to human review.
- Design individual OSai projects so they can remain independently deployable while securely integrating with the hub.
- Keep actual investment transactions out of scope until qualified counsel and compliant providers approve the operating model.
- Prefer accessible, responsive, performant, and understandable experiences over unnecessary complexity.
- Do not add scope, vendors, dependencies, or data collection without a clear product need.
- Preserve user changes and unrelated work already present in the repository.

## 6. Content and brand expectations

- Lead public pages with customer problems, OSai services, tangible outcomes, and a clear next action.
- Use plain, confident language. Avoid unsupported claims, vague AI superlatives, fabricated proof, and invented metrics.
- Distinguish active services and shipped work from experiments, concepts, inventions, and future plans.
- Present confidential or funding information only at its approved access level.
- Never invent testimonials, clients, partnerships, investment commitments, project progress, legal terms, or performance data.
- Treat the most recently approved brand and voice documents as authoritative once they exist.

## 7. Documentation expectations

When a decision materially changes the product, update the relevant foundation or architecture document as part of the work. Keep documentation aligned with the implementation.

For meaningful features or changes, capture:

- The business and user outcome
- The affected audience and access level
- The relevant process and page-flow references
- Acceptance criteria and important edge cases
- Data, security, privacy, legal, and analytics implications
- Dependencies, unresolved decisions, and deferred scope
- Verification performed

Do not overwrite historical or approved flow artifacts merely to make them match an implementation. Surface the discrepancy and update the correct source with user approval when needed.

## 8. Completion standard

Work is complete only when it:

- Aligns with the latest approved foundation and flows
- Supports the intended OSai business or hub outcome
- Preserves the correct access and data boundaries
- Handles important failure and empty states
- Meets relevant accessibility and responsive requirements
- Has been tested or otherwise verified at the appropriate level
- Leaves documentation accurate
- Clearly reports remaining assumptions, risks, or decisions

## 9. Current foundation documents

- `FOUNDATION_ROADMAP.md` — initial product vision, access model, architecture, phased delivery roadmap, and foundational decisions

Add new authoritative documents and diagrams to this list as they are created, while still performing repository discovery at the start of each task.
