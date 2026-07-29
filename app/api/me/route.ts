import { NextResponse } from 'next/server'
import { apiError, requireProfile } from '../../../src/server/authorization'
import { databaseConfigured } from '../../../src/server/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ configured: false, role: 'member' })
  try {
    const profile = await requireProfile(request)
    return NextResponse.json({ configured: true, profile })
  } catch (error) {
    const result = apiError(error, 'PROFILE_FAILED')
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
}
