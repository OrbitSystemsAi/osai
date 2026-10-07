ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS industry text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS x_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok_url text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  canonical_name text NOT NULL UNIQUE,
  summary text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  is_osai_stack boolean NOT NULL DEFAULT false,
  is_integratable boolean NOT NULL DEFAULT false,
  created_by text NOT NULL REFERENCES user_profiles(auth_user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tools_name_lower_idx ON tools (lower(name));

CREATE TABLE IF NOT EXISTS prospect_tools (
  prospect_id uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE RESTRICT,
  active boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (prospect_id, tool_id)
);

CREATE INDEX IF NOT EXISTS prospect_tools_tool_idx ON prospect_tools (tool_id);
