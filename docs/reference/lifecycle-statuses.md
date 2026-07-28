# Canonical Lifecycle Statuses

## Purpose

These status identifiers are the shared language for the OSai interface, API, database, background jobs, analytics, and audit trail. Implementation work should reuse them rather than inventing nearby alternatives.

## Membership onboarding

| Status | Meaning | Responsible party | Allowed next states |
|---|---|---|---|
| `access_request_submitted` | Request received and recorded | System | `email_verification_pending` |
| `email_verification_pending` | Validation email sent; address not yet verified | Requester | `account_incomplete`, `expired` |
| `account_incomplete` | Email verified; remaining account setup required | Requester | `pending_approval`, `expired` |
| `pending_approval` | Identity and account setup complete; awaiting admin decision | Administrator | `approved`, `more_information_required`, `declined` |
| `more_information_required` | Administrator needs additional requester information | Requester | `pending_approval`, `declined`, `expired` |
| `approved` | Membership request approved and access grant created | System/admin | `general_nda_pending`, `revoked` |
| `declined` | Membership request declined | Administrator | Terminal unless a new request is permitted |
| `expired` | Request or invitation expired before completion | System/admin | Terminal or restart with a new request |
| `revoked` | Previously granted membership removed | Administrator | Terminal unless explicitly reinstated |

## General NDA

| Status | Meaning | Responsible party | Allowed next states |
|---|---|---|---|
| `general_nda_pending` | Current NDA is required but has not been sent | System/admin | `general_nda_sent` |
| `general_nda_sent` | Signing request delivered | Member | `general_nda_viewed`, `general_nda_signed`, `general_nda_expired` |
| `general_nda_viewed` | Member opened the agreement | Member | `general_nda_signed`, `general_nda_expired` |
| `general_nda_signed` | Verified completion received and access grant created | System | `general_nda_superseded`, `revoked` |
| `general_nda_expired` | Signing request expired before completion | System/admin | `general_nda_sent` |
| `general_nda_superseded` | A newer agreement version is required | System/admin | `general_nda_pending` |

## Project access

| Status | Meaning | Responsible party | Allowed next states |
|---|---|---|---|
| `project_access_requested` | Member requested access | Project owner/reviewer | `project_review_pending` |
| `project_review_pending` | Request is assigned and awaiting review | Project owner/reviewer | `project_information_required`, `project_agreement_pending`, `project_access_approved`, `project_access_declined` |
| `project_information_required` | Reviewer needs more information | Member | `project_review_pending`, `project_access_declined` |
| `project_agreement_pending` | Project-specific agreement is required | Member | `project_agreement_signed`, `project_access_declined` |
| `project_agreement_signed` | Required agreement completed | System | `project_access_approved` |
| `project_access_approved` | Project membership and grant are active | System/admin | `project_access_revoked` |
| `project_access_declined` | Project access was declined | Project owner/reviewer | Terminal unless reconsidered by policy |
| `project_access_revoked` | Existing project grant removed | Project owner/admin | Terminal unless explicitly reinstated |

## Beta participation and feedback

| Status | Meaning | Responsible party | Allowed next states |
|---|---|---|---|
| `beta_invited` | Participant invitation sent | Participant | `beta_accepted`, `beta_declined`, `beta_invitation_expired` |
| `beta_accepted` | Participant joined the beta | Participant/system | `beta_active`, `beta_withdrawn` |
| `beta_active` | Participant may use the current beta | Participant | `feedback_requested`, `beta_completed`, `beta_withdrawn` |
| `feedback_requested` | Product team requested feedback | Participant | `feedback_submitted`, `beta_completed` |
| `feedback_submitted` | Feedback received and acknowledged | Product team | `feedback_triaged` |
| `feedback_triaged` | Feedback categorized and assigned | Product team | Product-specific resolution states |
| `beta_completed` | Participation period completed | System/admin | Terminal |
| `beta_declined` | Invitation declined | Participant | Terminal |
| `beta_invitation_expired` | Invitation expired without response | System | `beta_invited` if reissued |
| `beta_withdrawn` | Participant or administrator ended participation | Participant/admin | Terminal |

## Operational metadata

Lifecycle status and operational state are separate. Do not replace a lifecycle status with “stalled.” Attach operational metadata instead:

- `entered_status_at`
- `assigned_owner_id`
- `stalled_at`
- `stall_reason`
- `last_activity_at`
- `last_nudged_at`
- `nudge_count`
- `next_nudge_at`
- `snoozed_until`
- `escalated_at`

This preserves the actual business state while allowing the operations layer to identify and manage delay.

## Transition requirements

- State transitions must occur server-side and be permission-checked.
- Every transition must record its actor, source, previous state, new state, reason, and timestamp.
- Provider webhooks must be validated, idempotent, and reconciled.
- Email delivery does not itself prove that the underlying business transition succeeded.
- Terminal states must require an explicit new workflow or approved reinstatement path before access resumes.
