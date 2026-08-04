import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../../../src/server/authorization'
import { db } from '../../../../../src/server/database'
import { submitToOnn } from '../../../../../src/server/onn'
import { parsePostInput, postFromRow } from '../../../../../src/server/posts'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  let claimed: Record<string, unknown> | undefined
  let profile: Awaited<ReturnType<typeof requireProfile>> | undefined
  try {
    profile = await requireProfile(request)
    const { id } = await context.params
    const sql = db()
    const existing = await sql`SELECT * FROM osai_posts WHERE id=${id} AND author_auth_user_id=${profile.authUserId} AND submission_status IN ('local_draft','failed') LIMIT 1`
    if (!existing[0]) return NextResponse.json({ error: 'POST_NOT_SUBMITTABLE' }, { status: 409 })
    parsePostInput({ section: existing[0].section, title: existing[0].title, summary: existing[0].summary, body: existing[0].body, contributorName: existing[0].contributor_name, topics: existing[0].topics, citations: existing[0].citations, distribution: existing[0].distribution }, true)
    const rows = await sql`UPDATE osai_posts SET submission_status='submitting', submission_attempts=submission_attempts+1, last_submission_error=NULL, next_retry_at=NULL, updated_at=now() WHERE id=${id} AND author_auth_user_id=${profile.authUserId} AND submission_status IN ('local_draft','failed') RETURNING *`
    claimed = rows[0] as Record<string, unknown> | undefined
    if (!claimed) return NextResponse.json({ error: 'POST_NOT_SUBMITTABLE' }, { status: 409 })
    const input = parsePostInput({ section: claimed.section, title: claimed.title, summary: claimed.summary, body: claimed.body, contributorName: claimed.contributor_name, topics: claimed.topics, citations: claimed.citations, distribution: claimed.distribution }, true)
    const attempt = Number(claimed.submission_attempts)
    await sql`INSERT INTO osai_post_submission_attempts (post_id, actor_auth_user_id, attempt_number, outcome) VALUES (${String(claimed.id)}, ${profile.authUserId}, ${attempt}, 'started')`
    const result = await submitToOnn({ ...input, sourceApplication: 'osai', sourcePostId: String(claimed.id), authorAuthUserId: profile.authUserId, idempotencyKey: String(claimed.idempotency_key) })
    const completed = await sql`UPDATE osai_posts SET submission_status='submitted', onn_submission_id=${result.submissionId}, onn_content_id=${result.contentId}, submitted_at=now(), updated_at=now() WHERE id=${String(claimed.id)} RETURNING *`
    await sql`INSERT INTO osai_post_submission_attempts (post_id, actor_auth_user_id, attempt_number, outcome, response_status) VALUES (${String(claimed.id)}, ${profile.authUserId}, ${attempt}, 'submitted', ${result.responseStatus})`
    return NextResponse.json({ post: postFromRow(completed[0] as Record<string, unknown>) })
  } catch (error) {
    if (claimed && profile) {
      const sql = db()
      const message = error instanceof Error ? error.message : 'ONN_SUBMISSION_FAILED'
      const status = typeof (error as { status?: unknown })?.status === 'number' ? (error as { status: number }).status : null
      const attempt = Number(claimed.submission_attempts)
      const delayMinutes = Math.min(60, 2 ** Math.max(0, attempt - 1))
      await sql`UPDATE osai_posts SET submission_status='failed', last_submission_error=${message}, next_retry_at=now() + (${delayMinutes} * interval '1 minute'), updated_at=now() WHERE id=${String(claimed.id)}`
      await sql`INSERT INTO osai_post_submission_attempts (post_id, actor_auth_user_id, attempt_number, outcome, response_status, error_code) VALUES (${String(claimed.id)}, ${profile.authUserId}, ${attempt}, 'failed', ${status}, ${message})`
      return NextResponse.json({ error: message, retryable: true }, { status: 502 })
    }
    const result = apiError(error, 'POST_SUBMIT_FAILED')
    const status = error instanceof Error && (error.message.startsWith('INVALID_') || error.message === 'POST_INCOMPLETE') ? 400 : result.status
    return NextResponse.json({ error: result.message }, { status })
  }
}
