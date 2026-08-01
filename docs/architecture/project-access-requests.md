# Project access requests

## Outcome

Every approved member can discover every non-archived OSai project without receiving confidential project content. A member can request access to one project, and an administrator can review and approve that exact request together with the Legal documents assigned to the project’s Legal group.

## Member flow

1. The Project Directory returns each project’s public identity, brief, image, published timeline, and the current member’s membership status.
2. A project tile always opens a limited project detail page. The timeline is read-only. The other pitch sections show only their descriptive subtitle.
3. **Request Access** creates or restores a `project_access_requested` membership for the authenticated immutable Neon Auth user ID.
4. The project’s Legal group and documents become available in the member’s Legal page for review and download.
5. Repeated requests are idempotent. Pending and active memberships are not duplicated.

## Administrator flow

- The Users directory marks the requested project with a **Requested** indicator.
- The project’s Legal-group documents appear with the request so the administrator can review the required legal package.
- Selecting the project approves the membership as `project_access_approved`.
- Requests are preserved when an administrator changes unrelated project assignments.

## Email delivery

The server attempts to notify every approved administrator through Resend. Delivery requires server-only `RESEND_API_KEY` and `OSAI_NOTIFICATION_FROM_EMAIL` values. The database request and audit event remain authoritative if email is unavailable; failed or unconfigured delivery is separately audited and never causes the member’s request to be lost.

## Access boundary

Project discovery is not authorization. Protected pitch content, project files, and mutations continue to require the appropriate server-validated membership state. Project Legal downloads are intentionally available to pending request states so members can review the required legal package before approval. Email addresses are notification destinations only and are never used as relational identity keys.
