# Administrator Authorization and Project Management

## Outcome

Selected OSai application profiles may hold the `admin` role. Administrators can manage profile roles and create, edit, publish, archive, or remove projects. Authentication alone never grants these permissions.

Each project also has an administrator-only operating view with an image, brief, membership-derived actual user count, editable goals and financial planning fields, adoption and penetration forecasts, milestones, and tasks. These planning values remain neutral until an administrator enters verified project data; the interface does not infer traction, funding, or market claims.

## Authorization boundary

- Neon Auth validates the session and supplies the immutable user ID.
- `user_profiles.role` is the application-owned authorization source.
- Every `/api/admin/*` request validates both the session and current database role.
- UI visibility is only a convenience; the API remains the enforcement boundary.
- Role and project mutations write immutable-style audit records containing the actor, action, target, and timestamp.
- Project dashboard mutations use the same server-side administrator check and write `project.dashboard_updated` audit events.

## Setup

1. Apply the SQL files in `db/migrations` to the application Neon database in numeric order, including `003_project_dashboards.sql`.
2. Configure `DATABASE_URL` as a server-only environment variable.
3. Add the first administrator's immutable Neon Auth user ID to `OSAI_BOOTSTRAP_ADMIN_USER_IDS`.
4. Have that user sign in once so `/api/me` creates or updates the application profile.
5. Use **Users** for subsequent administrator assignments.

The bootstrap value accepts comma-separated immutable user IDs. Do not use email addresses as bootstrap identifiers.

## Users directory

The Admin Hub **Users** page shows every application profile that has been materialized in `user_profiles`, including the administrator. Each row displays the account lifecycle status, application role, and project-membership count. Administrators assign or remove projects through the Projects multi-select. A selected project is stored in `project_memberships` with the canonical `project_access_approved` status; removing a selection removes that membership. The server verifies the administrator role, target profile, and active project identifiers before applying the complete selection, and records the result as a `profile.projects_assigned` audit event.

Neon Auth identities become application profiles when they first pass through `/api/me`. A future administrative identity-sync job may materialize dormant Neon Auth accounts that have never entered the hub; until then, “all users” means all OSai application profiles, not untouched authentication-only records.

## Access levels

Projects retain the foundation access levels: `public`, `member`, `general_nda`, `project_nda`, `beta`, and `internal`. Publishing a catalog record does not by itself grant access to protected project content; project-room authorization remains a separate enforcement task.
