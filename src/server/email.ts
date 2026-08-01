type ProjectAccessEmail = {
  adminEmails: string[]
  memberName: string
  memberEmail: string
  projectId: string
  projectName: string
  projectUrl: string
}

export type EmailDelivery = 'sent' | 'not_configured' | 'failed'

export async function sendProjectAccessRequestEmail(input: ProjectAccessEmail): Promise<EmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.OSAI_NOTIFICATION_FROM_EMAIL?.trim()
  const to = [...new Set(input.adminEmails.map(email => email.trim().toLowerCase()).filter(Boolean))]
  if (!apiKey || !from || !to.length) return 'not_configured'

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': `project-access-${input.projectId}-${input.memberEmail.toLowerCase()}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Project access request: ${input.projectName}`,
        text: `${input.memberName} (${input.memberEmail}) requested access to ${input.projectName}.\n\nReview the request in the OSai Admin Hub:\n${input.projectUrl}`,
      }),
      cache: 'no-store',
    })
    return response.ok ? 'sent' : 'failed'
  } catch {
    return 'failed'
  }
}
