import 'server-only'
import type { PostInput } from './posts'

export type OnnSubmission = PostInput & {
  sourceApplication: 'osai'
  sourcePostId: string
  authorAuthUserId: string
  idempotencyKey: string
}

type OnnApiResponse = {
  data?: { id?: unknown }
  error?: { code?: unknown; message?: unknown }
}

function topicSlug(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function submitToOnn(payload: OnnSubmission) {
  const endpoint = process.env.ONN_PUBLISHING_API_URL?.trim()
  const token = process.env.ONN_PUBLISHING_API_TOKEN?.trim()
  if (!endpoint || !token) throw new Error('ONN_NOT_CONFIGURED')
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': payload.idempotencyKey,
    },
    body: JSON.stringify({
      externalContentId: payload.sourcePostId,
      publicationSlug: 'osai-editorial',
      contentType: 'insight',
      title: payload.title,
      summary: payload.summary,
      body: payload.body,
      language: 'en',
      distributionLevel: payload.distribution.audience === 'public' ? 'public' : 'application',
      contributor: {
        externalContributorId: payload.authorAuthUserId,
        displayName: payload.contributorName,
        byline: payload.contributorName,
      },
      topics: payload.topics.map(topic => ({ slug: topicSlug(topic), weight: 1 })),
      citations: payload.citations,
      metadata: {
        sourceApplication: payload.sourceApplication,
        section: payload.section,
        channels: payload.distribution.channels,
      },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  })
  const result = await response.json().catch(() => ({})) as OnnApiResponse
  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500
    const code = typeof result.error?.code === 'string' ? result.error.code : retryable ? 'ONN_TEMPORARY_FAILURE' : 'ONN_SUBMISSION_REJECTED'
    const error = new Error(code) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  if (typeof result.data?.id !== 'string' || !result.data.id) throw new Error('ONN_INVALID_RESPONSE')
  return { submissionId: result.data.id, contentId: result.data.id, responseStatus: response.status }
}
