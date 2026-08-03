# Project Legal Groups and Document Uploads

## Outcome

Every project has one Legal project group with the same title. The administrator project API creates the project and group in one database statement, renaming the project synchronizes the group in one statement, and deleting the project removes its group and associated uploaded files.

Only administrators may create, edit, or delete projects. Only administrators see the Legal upload interface or may call the upload endpoint. A selected file is not accepted until the administrator selects a project group and explicitly confirms that assignment.

## Authorization and access

- `POST /api/admin/legal/documents` validates the Neon session and current `user_profiles.role` through `requireAdmin`.
- The server requires `projectGroupId` and `confirmedProjectGroupId` to match and verifies that the group exists before storing a document.
- `GET /api/legal` returns every project group to administrators. Members receive only non-archived groups for which their immutable auth user ID has a signed or approved project membership; unassigned project titles and document metadata are not exposed.
- `GET /api/legal/documents/:id` repeats the same access decision before returning file bytes. Non-administrators must also have a verified completed General MNDA for the current DocuSign environment. The developer sandbox completion unlocks only the test sequence and does not grant real project access. Files are never exposed through public URLs.
- Upload and project mutations write audit events with the immutable Neon Auth user ID.

## Storage and lifecycle

The current implementation stores PDF, DOC, and DOCX files up to 10 MB in Neon Postgres. This keeps the first implementation private and authorization-aware without adding a storage vendor. Approved object storage with expiring URLs remains the preferred production evolution.

Project deletion currently cascades to the Legal group and its uploaded documents. A counsel-approved retention rule must replace this behavior before these uploads become executed agreements or other records that require preservation.

Apply `db/migrations/005_project_legal_groups.sql` after migrations 001–004.
