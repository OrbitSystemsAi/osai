# Administrator Authorization and Project Management

## Outcome

Selected OSai application profiles may hold the `admin` role. Administrators can manage profile roles and create, edit, publish, archive, or remove projects. Authentication alone never grants these permissions.

## Authorization boundary

- Neon Auth validates the session and supplies the immutable user ID.
- `user_profiles.role` is the application-owned authorization source.
- Every `/api/admin/*` request validates both the session and current database role.
- UI visibility is only a convenience; the API remains the enforcement boundary.
- Role and project mutations write immutable-style audit records containing the actor, action, target, and timestamp.

## Setup

1. Apply `db/migrations/001_admin_and_projects.sql` to the application Neon database.
2. Configure `DATABASE_URL` as a server-only environment variable.
3. Add the first administrator's immutable Neon Auth user ID to `OSAI_BOOTSTRAP_ADMIN_USER_IDS`.
4. Have that user sign in once so `/api/me` creates or updates the application profile.
5. Use **Users** for subsequent administrator assignments.

The bootstrap value accepts comma-separated immutable user IDs. Do not use email addresses as bootstrap identifiers.

## Users directory

The Admin Hub **Users** page shows every application profile that has been materialized in `user_profiles`, including the administrator. Each row displays the account lifecycle status, application role, number of project memberships, and the role and access status for each project. Project involvement is stored in `project_memberships` and retains the canonical project-access status identifiers.

Neon Auth identities become application profiles when they first pass through `/api/me`. A future administrative identity-sync job may materialize dormant Neon Auth accounts that have never entered the hub; until then, “all users” means all OSai application profiles, not untouched authentication-only records.

## Access levels

Projects retain the foundation access levels: `public`, `member`, `general_nda`, `project_nda`, `beta`, and `internal`. Publishing a catalog record does not by itself grant access to protected project content; project-room authorization remains a separate enforcement task.
