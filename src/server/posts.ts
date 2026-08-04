export const POST_SECTIONS = ['OSai Briefing', 'Portfolio Notes', 'Inside OSai', 'From the Lab'] as const
export const POST_AUDIENCES = ['public', 'members'] as const

export type Citation = { label: string; url: string }
export type PostInput = {
  section: string
  title: string
  summary: string
  body: string
  contributorName: string
  topics: string[]
  citations: Citation[]
  distribution: { channels: string[]; audience: string }
}

function text(value: unknown, max: number) {
  if (typeof value !== 'string') throw new Error('INVALID_POST')
  return value.trim().slice(0, max)
}

export function parsePostInput(value: unknown, requireComplete = false): PostInput {
  if (!value || typeof value !== 'object') throw new Error('INVALID_POST')
  const input = value as Record<string, unknown>
  const section = text(input.section, 60)
  const title = text(input.title, 100)
  const summary = text(input.summary, 220)
  const body = text(input.body, 50000)
  const contributorName = text(input.contributorName, 100)
  if (!POST_SECTIONS.includes(section as typeof POST_SECTIONS[number])) throw new Error('INVALID_SECTION')

  const topics = Array.isArray(input.topics)
    ? [...new Set(input.topics.map(topic => text(topic, 40)).filter(Boolean))].slice(0, 12)
    : []
  const citations = Array.isArray(input.citations) ? input.citations.slice(0, 20).map(item => {
    if (!item || typeof item !== 'object') throw new Error('INVALID_CITATION')
    const citation = item as Record<string, unknown>
    const label = text(citation.label, 120)
    const url = text(citation.url, 2000)
    if (!label || !url) throw new Error('INVALID_CITATION')
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:') throw new Error()
    } catch { throw new Error('INVALID_CITATION_URL') }
    return { label, url }
  }) : []
  const rawDistribution = input.distribution && typeof input.distribution === 'object'
    ? input.distribution as Record<string, unknown> : {}
  const audience = text(rawDistribution.audience || 'public', 20)
  if (!POST_AUDIENCES.includes(audience as typeof POST_AUDIENCES[number])) throw new Error('INVALID_AUDIENCE')
  const channels = Array.isArray(rawDistribution.channels)
    ? [...new Set(rawDistribution.channels.map(channel => text(channel, 30)).filter(Boolean))]
    : ['onn']
  if (!channels.length || channels.some(channel => channel !== 'onn')) throw new Error('INVALID_DISTRIBUTION')
  if (!contributorName || (requireComplete && (!title || !summary || !body || !topics.length))) throw new Error('POST_INCOMPLETE')
  return { section, title, summary, body, contributorName, topics, citations, distribution: { channels, audience } }
}

export function postFromRow(row: Record<string, unknown>) {
  return {
    id: String(row.id), section: String(row.section), title: String(row.title), summary: String(row.summary),
    body: String(row.body), contributorName: String(row.contributor_name), topics: row.topics || [],
    citations: row.citations || [], distribution: row.distribution,
    submissionStatus: String(row.submission_status), submissionAttempts: Number(row.submission_attempts),
    onnSubmissionId: row.onn_submission_id || null, onnContentId: row.onn_content_id || null,
    lastSubmissionError: row.last_submission_error || null, nextRetryAt: row.next_retry_at || null,
    submittedAt: row.submitted_at || null, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
