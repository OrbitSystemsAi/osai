# Administrator Authorization and Project Management

## Outcome

Selected OSai application profiles may hold the `admin` role. Administrators can manage profile roles and create, edit, publish, archive, or remove projects. Authentication alone never grants these permissions.

Each project also has an administrator-only operating view with an image, brief, membership-derived actual user count, editable goals and financial planning fields, adoption and penetration forecasts, milestones, and tasks. These planning values remain neutral until an administrator enters verified project data; the interface does not infer traction, funding, or market claims.

## Authorization boundary

- The dedicated OSai Clerk application validates the browser session and supplies the authenticated Clerk user ID.
- Neon Postgres stores the application profile, role, project memberships, agreement state, and audit history; it does not establish browser sessions.
- `user_profiles.role` is the application-owned authorization source.
- New application profiles receive the `client` role. Administrators may assign `client`, `member`, or `admin`; existing roles are never inferred from Clerk metadata or selected by the user.
- Every `/api/admin/*` request validates both the session and current database role.
- UI visibility is only a convenience; the API remains the enforcement boundary.
- Role and project mutations write immutable-style audit records containing the actor, action, target, and timestamp.
- Project dashboard mutations use the same server-side administrator check and write `project.dashboard_updated` audit events.
- `/admin/passkeys` is an OSai-only exception for protected telephone-action credentials. It requires a Google ID token that Sophia verifies against the configured OAuth client ID, verified-email requirement, and backend-only passkey-administrator allowlist. The website does not store that allowlist or decide eligibility. A Sophia passkey never grants or changes a Clerk session, Neon role, agreement state, or project access.

## Setup

1. Apply the SQL files in `db/migrations` to the application Neon database in numeric order, including `003_project_dashboards.sql`.
2. Configure `DATABASE_URL` as a server-only environment variable.
3. Add the first administrator's immutable Clerk/application identity ID to `OSAI_BOOTSTRAP_ADMIN_USER_IDS`.
4. Have that user sign in once so `/api/me` creates or updates the application profile.
5. Use **Users** for subsequent administrator assignments.

The bootstrap value accepts comma-separated immutable user IDs. Do not use email addresses as bootstrap identifiers.

## Users directory

The Admin Hub **Users** page shows every application profile that has been materialized in `user_profiles`, including the administrator. Each row displays the account lifecycle status, required legal documents from assigned projects, application role, project-membership count, and project-derived teams. A team exists when two or more users collaborate through membership in the same project; it is not a separately maintained account structure. Administrators assign or remove projects through the Projects multi-select. A selected project is stored in `project_memberships` with the canonical `project_access_approved` status; removing a selection removes that membership. The server verifies the administrator role, target profile, and active project identifiers before applying the complete selection, and records the result as a `profile.projects_assigned` audit event. The directory search covers identity, status, role, project, and legal-document names.

Administrators may permanently delete a member from the role/action menu after an explicit confirmation. The server prevents self-deletion and deletes the application profile in a Neon database transaction that also records the deletion audit event. Related OSai project memberships are removed through database foreign-key cascades. After the database transaction succeeds, the server requests deletion of the corresponding Clerk identity, which invalidates that account's Clerk sessions. The audit event is keyed by the former immutable application identity ID without copying the member's email or display name into audit metadata. If the member created or last updated project or Legal records, deletion is rejected until those records are reassigned; protected business and Legal history is never silently removed.

The administrator-only **Prospects** directory stores private lead records separately from authenticated application profiles. Adding a prospect records the name and optional company, email, phone, website URL, and notes in Neon and writes an audit event; it never creates a Clerk account, sends an invitation, or grants access. Selecting a prospect tile opens its admin-only editable detail route, where the same fields and prospect status can be maintained. The **Clients** directory displays authenticated profiles whose application-owned role is `client`. The legacy member-facing Role and Status labels are derived from both the application profile and durable General MNDA envelope state. A site-approved `member` without a verified completed production General MNDA is shown as **Site Member** with **Pending MNDA** status. A completed DocuSign demo envelope never satisfies this gate. After verified production completion, the member is shown as **Pending Approval** until the separate final administrator-approval state is implemented.

In the administrator Project Directory, selecting the project tile or its explicit **Edit** action opens the same administrator project-detail editor. The administrator view includes an **Access** section in its project navigation for project-specific access administration; this section is not exposed in the member project navigation. The separate **Delete** action remains scoped to deletion and never opens the project editor.

The member Project Directory is a discoverable catalog of every non-archived project. Catalog discovery does not grant protected project access: members receive only the project identity, brief, image, published timeline, and their own membership status. The member detail view keeps the pitch navigation visible but exposes only the timeline and section subtitles. Protected project content and project Legal documents remain membership-gated.

Members request a specific project through `POST /api/projects/:id/access-request`. The server records `project_access_requested` against the immutable auth user ID, writes an audit event, and attempts an administrator email notification. The request appears as **Requested** in the Admin Hub project assignment control, where selecting it promotes the membership to `project_access_approved`. Project Legal documents are resolved from that project’s Legal group and become available to the requesting member immediately so required agreements can be reviewed before approval; protected pitch content remains locked until the project access decision permits it.

Clerk identities become application profiles when they first pass through `/api/me`. During migration, a verified primary email may be used once to reconcile a Clerk identity with an existing OSai profile; subsequent authorization uses the stored immutable application identity ID. A future administrative identity-sync job may materialize dormant Clerk accounts that have never entered the hub; until then, “all users” means all OSai application profiles, not untouched authentication-only records.

## Access levels

Projects retain the foundation access levels: `public`, `member`, `general_nda`, `project_nda`, `beta`, and `internal`. Publishing a catalog record does not by itself grant access to protected project content; project-room authorization remains a separate enforcement task.
