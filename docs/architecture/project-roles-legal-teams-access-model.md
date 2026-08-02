# Project Roles, Legal Documents, Teams, and Access Model

**Status:** Proposed for owner review  
**Decision owner:** Orbit Systems / OSai  
**Purpose:** Define who belongs to a project Team, what each role may do, how project Legal documents affect access, and when an administrator may approve or revoke access.

> This document is a product and system workflow proposal, not legal advice. Counsel must determine which documents require signatures, acknowledgements, identity verification, retention, or DocuSign envelopes. Until that decision is approved, “Legal complete” means an OSai administrator has verified completion; it must not be inferred from a download or a member clicking a self-attestation button.

## 1. Intended outcome

Every project has one Team and one Legal project group. Team membership and project access are related but not identical:

- **Team membership** records a person's relationship to the project and their project role.
- **Legal readiness** records whether that person has completed every currently required document for the project.
- **Access approval** records the administrator's decision to activate protected project access.
- **Authorization** is calculated server-side from the person's OSai account, role, project membership, Legal readiness, and membership status.

No client-side button, URL, project tile, email address, or downloaded file grants protected access by itself.

## 2. Roles

### 2.1 OSai Administrator

An approved OSai Administrator is automatically part of every non-archived project Team.

**Rights**

- View every project and project Team.
- Add, edit, publish, archive, and delete projects.
- Upload and manage Legal documents for every project.
- Assign or change a Project Owner.
- Invite, assign, approve, decline, revoke, or remove project members.
- Verify Legal-document completion.
- Edit all project pages, timelines, tasks, and protected content.
- Review the audit trail.

**Legal state**

- Administrators are not blocked from project administration by project-member Legal requirements.
- This administrative bypass must be explicit in authorization logic and audit records; it does not imply that an administrator has personally executed a document when a signature is legally required.

### 2.2 Project Owner

A Project Owner is the person accountable for the project. A project must have one primary Owner. Additional owners should be deferred until the business rule is approved.

**Automatic Team behavior**

- The Owner is automatically added to the project's Team when assigned.
- If the Owner is also an OSai Administrator, administrator rights apply.
- A non-administrator Owner begins in **Pending Legal** when the project has required Legal documents.
- If the project has no required Legal documents, the Owner begins in **Pending Admin Approval**.

**Proposed rights before activation**

- See the project in the directory.
- Open the limited project preview.
- View and download the Legal documents assigned to the project.
- See their own Legal and approval status.
- No project editing, deletion, publishing, user approval, or Legal-document upload rights.

**Proposed rights after Legal completion and administrator approval**

- View protected project content.
- Participate in the project Team.
- Owner editing rights are a separate decision. The current approved rule remains: only OSai Administrators can add, edit, or delete projects.

### 2.3 Member / Contributor

A Member may discover every non-archived project but does not automatically belong to every Team.

**Before requesting access**

- See the project grid without admin Edit or Delete controls.
- Open the limited project page.
- See the read-only Timeline.
- See only the subtitle for the other pitch sections.
- Request access to a specific project.

**After requesting access**

- A pending project membership is created for the immutable Neon Auth user ID.
- The project's Legal group becomes visible in Legal.
- The member can view or download required project documents.
- Protected project content remains unavailable.

**After Legal completion**

- The membership moves to **Pending Admin Approval**.
- Protected project content remains unavailable until an administrator approves the membership.

**After administrator approval**

- The member becomes an active Team member.
- Protected access is limited to the level and content approved for that project role.
- Editing, deletion, publishing, Legal upload, and member approval remain administrator-only unless a future approved role matrix explicitly delegates them.

## 3. Project Team definition

The Team is the union of:

1. all approved OSai Administrators, included automatically with the role **Administrator**;
2. the project's assigned primary Owner, included automatically with the role **Owner**;
3. requested or assigned Members, included with their project role and current access state.

The Team page should show durable system data rather than manually entered names.

### Team row fields

- **Name** — from `user_profiles.display_name`.
- **Role** — Administrator, Owner, Contributor, Participant, or another approved project role.
- **Legal** — Not Required, Pending, or Completed.
- **Access** — Pending Legal, Pending Admin Approval, Active, Declined, or Revoked.
- **Task / Next action** — context-sensitive guidance such as Complete Legal Documents, Awaiting Admin Approval, Review Access Request, or None.

### Visibility

- Administrators may see the full Team roster and administrative actions.
- Active Team members may see a limited roster only if OSai approves that privacy rule.
- Preview-only members should continue to see only the Team subtitle; they must not see names, roles, Legal status, email addresses, or tasks.

## 4. Legal-document model

### 4.1 Project Legal group

- Every project has exactly one Legal project group.
- The group title follows the Project Title.
- Only administrators may upload, replace, version, or remove project Legal documents.
- Uploading a document requires explicit confirmation of its Project Group assignment.

### 4.2 Required documents

Every active document in the project's Legal group is proposed to be required for non-administrator Team activation unless an administrator marks it informational or optional. Because optionality is not yet represented in the current data model, the initial safe rule is: **every active project Legal document is required**.

Adding a new required document after members are active creates a policy question:

- **Recommended:** move affected non-administrator memberships to **Pending Legal** and suspend protected access until the new document is complete.
- **Alternative:** grandfather existing active members until a stated compliance deadline.

This decision must be confirmed before implementation.

### 4.3 Completion records

Completion must be recorded per user and per document, using the immutable Neon Auth user ID and the Legal document ID.

Each record should preserve:

- project ID and document ID;
- member's immutable auth user ID;
- completion status;
- completion or verification timestamp;
- the administrator who verified it;
- provider or envelope reference when DocuSign is used;
- document version or immutable document ID;
- optional notes appropriate for the audit trail.

Downloading or opening a document is not completion.

### 4.4 Document replacement and deletion

- A completed document record must continue to point to the exact document/version that was completed.
- Replacing a document should create a new version rather than silently overwriting the completed record.
- Executed agreements and completion evidence must not be hard-deleted unless the retention policy and counsel permit it.
- Project deletion must not cascade-delete executed Legal records once production Legal workflows are enabled.

## 5. Membership and access states

| State | Meaning | Member access | Next actor |
|---|---|---|---|
| `not_requested` | No Team relationship exists | Directory and limited preview only | Member or admin |
| `project_access_requested` | Member requested this project | Limited preview + project Legal group | System/admin |
| `project_agreement_pending` | One or more required documents are incomplete | Limited preview + project Legal group | Member / Legal process |
| `project_review_pending` | All required documents are complete; admin decision is pending | Limited preview | Administrator |
| `project_access_approved` | Admin approved active membership | Protected access for approved role | Administrator for changes |
| `project_access_declined` | Admin declined the request | Limited preview | Administrator for reconsideration |
| `project_access_revoked` | Previously active access was removed | Limited preview | Administrator for reinstatement |

`project_agreement_signed` may remain as a provider event or compatibility status, but active access should be represented by `project_access_approved`. Signing alone must not bypass administrator approval.

## 6. Logical process

### 6.1 Project creation

1. An administrator creates a project.
2. The system creates the matching Legal project group in the same database transaction.
3. The creating administrator is visible as an automatic Administrator Team member.
4. The administrator assigns one primary Project Owner.
5. The system creates or updates the Owner membership.
6. If required Legal documents exist, the Owner state is **Pending Legal**; otherwise it is **Pending Admin Approval**.
7. The action is audited.

### 6.2 Administrator assignment of a member

1. An administrator selects a member for a project.
2. The system creates a Team membership; it does not immediately grant protected access.
3. The system evaluates every current required project Legal document.
4. If any are incomplete, status becomes `project_agreement_pending`.
5. If all are complete—or none are required—status becomes `project_review_pending`.
6. An administrator reviews the Legal state and approves or declines the member.
7. Approval changes status to `project_access_approved` and creates the effective access grant.

### 6.3 Member access request

1. The member selects **Request Access** on a project.
2. The server creates or restores `project_access_requested` for that project and auth user ID.
3. Administrators are notified; email delivery is secondary to the database and audit record.
4. The project Legal group becomes visible to that member.
5. The system transitions the membership to `project_agreement_pending` if required documents exist, otherwise `project_review_pending`.
6. After all required documents are verified, the membership becomes `project_review_pending`.
7. An administrator approves or declines it.

### 6.4 Legal completion

1. The member completes the document through the approved process.
2. DocuSign webhook/reconciliation or an administrator records verified completion.
3. The system writes an immutable per-document completion record and audit event.
4. The system recalculates Legal readiness for that member and project.
5. If any required document remains incomplete, status stays `project_agreement_pending`.
6. If all are complete, status becomes `project_review_pending`.
7. The member still has no protected access until administrator approval.

### 6.5 Approval

1. An administrator opens the access request.
2. The server verifies the requester still has an approved OSai account.
3. The server verifies every current required project document is complete.
4. If either check fails, approval is rejected server-side.
5. If both pass, status becomes `project_access_approved`.
6. The approval, actor, role, timestamp, and Legal readiness snapshot are audited.

### 6.6 Revocation or removal

1. An administrator revokes access or removes the person from the Team.
2. Protected access stops immediately.
3. The membership and completion history are retained for audit instead of being silently deleted.
4. Reinstatement requires a new administrator decision and a fresh Legal-readiness check.

## 7. Authorization rules

Every protected page, mutation, document download, and API response must apply these rules on the server.

1. Confirm a valid Neon Auth session.
2. Load the application profile by immutable auth user ID.
3. Deny revoked or unapproved OSai accounts.
4. If the profile is an approved Administrator, allow the authorized admin operation and audit it.
5. Otherwise, load the exact project membership.
6. Require `project_access_approved` for protected project content.
7. Permit pending members to access only the limited preview and the Legal documents required to complete the process.
8. Never use email as the relational key.
9. Never treat client-side visibility or a difficult-to-guess URL as authorization.

## 8. Administrator interface behavior

### Users directory

- Project assignment creates **Pending Legal** or **Pending Admin Approval**, never immediate approval.
- Each project assignment displays Legal progress, for example **2 of 3 complete**.
- **Approve** is disabled until every required document is complete.
- Admins may explicitly Decline, Revoke, Remove, or Reassign Role.
- Promoting a user to Administrator makes that approved administrator an automatic member of every Team.

### Project Team page

- Shows automatic Administrators, the Owner, and requested/assigned members.
- Shows Role, Legal, Access, and Next Action.
- Only administrators see edit, approval, removal, or deletion controls.
- Owners who are not administrators do not receive edit/delete rights under the current rule.

### Legal page

- Only administrators see upload controls.
- Members see only Legal groups associated with pending or active memberships.
- Document completion and verification status is visible to the affected member and administrators.

## 9. Important edge cases

- **No Legal documents:** a non-admin goes directly to Pending Admin Approval, not Active.
- **New required document:** recalculate all non-admin memberships according to the approved re-compliance policy.
- **Document removed:** preserve historical completion; recalculate against active required documents.
- **Owner changed:** retain the former Owner's history; determine whether they remain a Member or are revoked.
- **Administrator demoted:** remove automatic admin rights immediately; any continued project access requires explicit project memberships and current Legal readiness.
- **Account revoked:** deny all member and project access regardless of project status.
- **Project archived:** remove it from normal discovery and block project activity without deleting audit or Legal history.
- **Project deleted:** use archival or retention-safe deletion after Legal workflows are live.
- **Duplicate request:** return the existing pending/active membership; do not create duplicates.
- **Email failure:** preserve the database request and audit event; notification delivery must not control access state.

## 10. Decisions requiring owner confirmation

Please approve or revise these before implementation:

1. **Owner editing rights:** Keep add/edit/delete administrator-only, or allow an approved Owner to edit selected project content?
2. **Owner count:** Exactly one primary Owner, or multiple Owners?
3. **Legal completion authority:** DocuSign only, administrator verification, or both?
4. **Document requirement:** Is every active document required, or should documents support Required, Optional, and Informational classifications?
5. **New-document policy:** Immediately suspend active non-admin access, or provide a compliance deadline?
6. **Team visibility:** May active Team members see other members' names and roles? Legal status and email should remain administrator-only unless specifically approved.
7. **Removal semantics:** Revoke and retain history, or permit permanent deletion for mistaken test records only?
8. **Project deletion:** Archive by default once Legal records exist?
9. **Role vocabulary:** Use Owner, Contributor, and Participant, or another approved set?
10. **Approval notification:** Email only, in-app notification, or both?

## 11. Recommended initial approval

For the safest first release:

- one primary Owner;
- project creation/edit/delete remains administrator-only;
- all active project Legal documents are required;
- completion is accepted only from DocuSign verification or explicit administrator verification;
- approval is impossible until all required documents are complete;
- adding a new required document moves non-admin members back to Pending Legal;
- active members may see names and roles, but not other members' Legal details or email addresses;
- revocation retains history;
- projects with Legal history are archived rather than hard-deleted;
- notifications use both in-app records and email when configured.

## 12. Acceptance criteria after approval

- Administrators appear automatically on every Team without duplicate membership rows.
- Every project has one primary Owner and one Legal group.
- Owner and Member assignment cannot create immediate protected access.
- Legal readiness is calculated from durable per-user, per-document records.
- Approval is rejected server-side when Legal requirements are incomplete.
- Members cannot see protected content, edit controls, Legal upload controls, or private Team details before approval.
- Admin actions and Legal/access transitions are auditable by immutable auth user ID.
- Revocation takes effect immediately and preserves history.
- Automated tests cover each state transition and access denial.

