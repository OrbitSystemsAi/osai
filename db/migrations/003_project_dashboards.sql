ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS user_goal integer NOT NULL DEFAULT 0 CHECK (user_goal >= 0),
  ADD COLUMN IF NOT EXISTS cost_budget numeric(14,2) NOT NULL DEFAULT 0 CHECK (cost_budget >= 0),
  ADD COLUMN IF NOT EXISTS cost_actual numeric(14,2) NOT NULL DEFAULT 0 CHECK (cost_actual >= 0),
  ADD COLUMN IF NOT EXISTS adoption_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (adoption_rate BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS forecast_penetration numeric(5,2) NOT NULL DEFAULT 0 CHECK (forecast_penetration BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tasks jsonb NOT NULL DEFAULT '[]'::jsonb;

