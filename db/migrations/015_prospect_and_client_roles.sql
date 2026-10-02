ALTER TABLE user_profiles
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('prospect', 'client', 'member', 'admin'));

ALTER TABLE user_profiles
  ALTER COLUMN role SET DEFAULT 'prospect';
