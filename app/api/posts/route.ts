import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../src/server/authorization'
import { db } from '../../../src/server/database'
import { parsePostInput, postFromRow } from '../../../src/server/posts'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const profile = await requireProfile(request)
    const sql = db()
    const rows = await sql`SELECT * FROM osai_posts WHERE author_auth_user_id = ${profile.authUserId} ORDER BY updated_at DESC LIMIT 20`
    return NextResponse.json({ posts: rows.map(row => postFromRow(row as Record<string, unknown>)) })
  } catch (error) {
    const result = apiError(error, 'POSTS_LOAD_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile(request)
    const input = parsePostInput(await request.json())
    const sql = db()
    const rows = await sql`INSERT INTO osai_posts (author_auth_user_id, contributor_name, section, title, summary, body, topics, citations, distribution) VALUES (${profile.authUserId}, ${input.contributorName}, ${input.section}, ${input.title}, ${input.summary}, ${input.body}, ${input.topics}, ${JSON.stringify(input.citations)}, ${JSON.stringify(input.distribution)}) RETURNING *`
    return NextResponse.json({ post: postFromRow(rows[0] as Record<string, unknown>) }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'POST_CREATE_FAILED')
    const status = error instanceof Error && error.message.startsWith('INVALID_') || error instanceof Error && error.message === 'POST_INCOMPLETE' ? 400 : result.status
    return NextResponse.json({ error: result.message }, { status })
  }
}
