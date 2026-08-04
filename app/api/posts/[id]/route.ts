import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../../src/server/authorization'
import { db } from '../../../../src/server/database'
import { parsePostInput, postFromRow } from '../../../../src/server/posts'

export const runtime = 'nodejs'
type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const profile = await requireProfile(request)
    const { id } = await context.params
    const sql = db()
    const rows = await sql`SELECT * FROM osai_posts WHERE id = ${id} AND author_auth_user_id = ${profile.authUserId} LIMIT 1`
    if (!rows[0]) return NextResponse.json({ error: 'POST_NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ post: postFromRow(rows[0] as Record<string, unknown>) })
  } catch (error) {
    const result = apiError(error, 'POST_LOAD_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const profile = await requireProfile(request)
    const { id } = await context.params
    const input = parsePostInput(await request.json())
    const sql = db()
    const rows = await sql`UPDATE osai_posts SET contributor_name=${input.contributorName}, section=${input.section}, title=${input.title}, summary=${input.summary}, body=${input.body}, topics=${input.topics}, citations=${JSON.stringify(input.citations)}, distribution=${JSON.stringify(input.distribution)}, submission_status='local_draft', last_submission_error=NULL, next_retry_at=NULL, updated_at=now() WHERE id=${id} AND author_auth_user_id=${profile.authUserId} AND submission_status IN ('local_draft','failed') RETURNING *`
    if (!rows[0]) return NextResponse.json({ error: 'POST_NOT_EDITABLE' }, { status: 409 })
    return NextResponse.json({ post: postFromRow(rows[0] as Record<string, unknown>) })
  } catch (error) {
    const result = apiError(error, 'POST_SAVE_FAILED')
    const status = error instanceof Error && (error.message.startsWith('INVALID_') || error.message === 'POST_INCOMPLETE') ? 400 : result.status
    return NextResponse.json({ error: result.message }, { status })
  }
}
