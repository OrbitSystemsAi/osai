ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS problem_content jsonb NOT NULL DEFAULT '[]'::jsonb;
