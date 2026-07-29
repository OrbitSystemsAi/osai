import { readFile, readdir } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const sql = neon(databaseUrl)
const migrationFiles = (await readdir(new URL('../db/migrations/', import.meta.url)))
  .filter((name) => name.endsWith('.sql'))
  .sort()

for (const file of migrationFiles) {
  const source = await readFile(new URL(`../db/migrations/${file}`, import.meta.url), 'utf8')
  const statements = source.split(/;\s*(?:\n|$)/).map((statement) => statement.trim()).filter(Boolean)
  for (const statement of statements) {
    await sql.query(statement, [], { arrayMode: false, fullResults: false })
  }
  console.log(`Applied ${file}`)
}

const authTables = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'neon_auth'
  ORDER BY table_name
`
console.log(`Neon Auth tables: ${authTables.map((row) => row.table_name).join(', ') || 'none visible'}`)
