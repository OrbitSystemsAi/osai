import { neon } from '@neondatabase/serverless'

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim())
}

export function db() {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) throw new Error('DATABASE_NOT_CONFIGURED')
  return neon(url)
}
