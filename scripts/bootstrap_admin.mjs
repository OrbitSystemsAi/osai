import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL?.trim()
const authUserId = process.env.ADMIN_AUTH_USER_ID?.trim()
if (!databaseUrl || !authUserId) throw new Error('DATABASE_URL and ADMIN_AUTH_USER_ID are required')

const sql = neon(databaseUrl)
const users = await sql.query('SELECT id, email, name FROM neon_auth."user" WHERE id = $1', [authUserId])
if (users.length !== 1) throw new Error('The requested Neon Auth user was not found')
const user = users[0]

const profiles = await sql`
  INSERT INTO user_profiles (auth_user_id, email, display_name, role, status)
  VALUES (${user.id}, ${user.email}, ${user.name || user.email.split('@')[0]}, 'admin', 'approved')
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    role = 'admin',
    status = 'approved',
    updated_at = now()
  RETURNING auth_user_id, email, display_name, role, status
`

await sql`
  INSERT INTO audit_events (actor_auth_user_id, action, target_type, target_id, metadata)
  VALUES (${user.id}, 'profile.admin_bootstrapped', 'user_profile', ${user.id}, ${JSON.stringify({ source: 'initial_setup' })}::jsonb)
`
console.log(JSON.stringify(profiles[0], null, 2))
