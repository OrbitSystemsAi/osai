import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../../src/server/authorization'
import { sendSupportQuestionEmail } from '../../../../src/server/email'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const profile = await requireProfile(request)
    const body = await request.json().catch(() => ({})) as { question?: unknown }
    const question = typeof body.question === 'string' ? body.question.trim() : ''
    if (question.length < 10 || question.length > 2000) {
      return NextResponse.json({ error: 'INVALID_QUESTION' }, { status: 400 })
    }
    const emailDelivery = await sendSupportQuestionEmail({
      memberName: profile.displayName,
      memberEmail: profile.email,
      question,
    })
    if (emailDelivery !== 'sent') {
      return NextResponse.json({ error: 'SUPPORT_EMAIL_UNAVAILABLE' }, { status: 503 })
    }
    return NextResponse.json({ status: 'submitted' }, { status: 201 })
  } catch (error) {
    const result = apiError(error, 'SUPPORT_QUESTION_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
