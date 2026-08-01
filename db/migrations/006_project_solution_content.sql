ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS solution_content jsonb NOT NULL DEFAULT '[]'::jsonb;
