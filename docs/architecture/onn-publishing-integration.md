# OSai to ONN Publishing Integration

## Outcome

OSai owns its authenticated editorial experience and local draft records. Authors compose and preview a post inside OSai, save it to OSai's Neon Postgres database, and separately submit the saved version to the ONN publishing API. ONN receives a typed, application-neutral publishing contract and does not host OSai-specific posting screens.

## Authorization and ownership

- Every `/api/posts/*` request revalidates the Neon Auth bearer session on the server.
- Posts are related to `user_profiles` by immutable Neon Auth user ID, never email.
- Authors may read, update, and submit only their own records.
- Editing a post returns it to `local_draft`; a post currently being submitted cannot be edited.
- ONN credentials are server-only and are never returned to or used by the browser.

## Local content model

`osai_posts` stores the title, summary, body, contributor, OSai section, topics, citations, distribution settings, local/submission status, ONN identifiers, retry timing, and timestamps. `osai_post_submission_attempts` records submission starts, successes, and failures without storing the ONN credential or full content payload.

The user interface explicitly distinguishes these states:

- **Not yet saved** — browser form only.
- **Saved locally** — durable OSai draft; not submitted to ONN.
- **Submitting to ONN** — an in-flight server request.
- **Submitted to ONN** — ONN accepted the post and returned a submission identifier.
- **Submission failed** — the OSai draft remains safe and may be retried.

## ONN contract

OSai sends a server-side `POST` request to `ONN_PUBLISHING_API_URL` with bearer authorization and an `Idempotency-Key` header. The adapter maps the local draft to ONN's application-neutral contract: external content ID, `osai-editorial` publication, content type, title, summary, body, language, distribution level, contributor, weighted topic slugs, citations, and source metadata.

ONN returns its standard `{ data, meta }` envelope with a non-empty content ID. This is the shared typed submission boundary; OSai-specific UI and workflow remain in this application.

## Validation, status, and retries

Draft input is normalized and validated on every create and update request. Submission repeats validation with all publish-required fields enforced. Citation URLs must use HTTPS, supported sections and audiences are allow-listed, and lengths and collection sizes are bounded.

Before calling ONN, the server atomically claims a local or failed post as `submitting` and increments the attempt counter. Each post keeps one stable idempotency key across retries. A failed request returns the record to `failed`, records a safe error code, and calculates an exponential retry time capped at 60 minutes. The editor exposes an explicit retry action; a future worker may use `next_retry_at` for automated delivery without changing the contract.

## Configuration

- `DATABASE_URL` — server-only OSai application database
- `ONN_PUBLISHING_API_URL` — server-only ONN submission endpoint
- `ONN_PUBLISHING_API_TOKEN` — server-only ONN bearer credential

If ONN is not configured, submission fails closed with `ONN_NOT_CONFIGURED`; the local OSai draft is retained and the interface clearly reports that it was not submitted.

## Verification

The August 4, 2026 Step 2 verification submitted a controlled OSai record through its project-scoped credential, repeated the same request idempotently, and confirmed the same ONN submission ID was returned.

- Apply `db/migrations/014_osai_posts.sql` through the repository migration runner.
- Run lint and a production build.
- Verify create, reload, update, submit, failure, and retry behavior with an authenticated non-admin member.
- Verify one member cannot load or mutate another member's post ID.
- Verify the ONN credential and authorization header never appear in browser traffic or API responses.
- Verify the editor at desktop and mobile breakpoints, including validation, failure messaging, keyboard focus, and disabled submission states.
