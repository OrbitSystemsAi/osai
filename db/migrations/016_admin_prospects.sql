CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  company_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  notes text NOT NULL DEFAULT '',
  created_by text NOT NULL REFERENCES user_profiles(auth_user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospects_created_at_idx ON prospects (created_at DESC);
CREATE INDEX IF NOT EXISTS prospects_email_lower_idx ON prospects (lower(email)) WHERE email <> '';

-- Prospects are private CRM records, not authenticated application users.
UPDATE user_profiles SET role = 'client', updated_at = now() WHERE role = 'prospect';

ALTER TABLE user_profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('client', 'member', 'admin'));
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'client';
