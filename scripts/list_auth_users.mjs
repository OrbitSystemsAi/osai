import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) throw new Error('DATABASE_URL is required')
const sql = neon(databaseUrl)

const columns = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'neon_auth' AND table_name = 'user'
  ORDER BY ordinal_position
`
const names = new Set(columns.map((row) => row.column_name))
for (const required of ['id', 'email', 'name']) {
  if (!names.has(required)) throw new Error(`Expected neon_auth.user.${required} was not found`)
}

const users = await sql.query('SELECT id, email, name, "emailVerified", "createdAt" FROM neon_auth."user" ORDER BY "createdAt"', [])
console.log(JSON.stringify(users, null, 2))
