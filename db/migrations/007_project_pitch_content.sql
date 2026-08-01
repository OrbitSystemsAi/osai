ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS competition_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS market_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS business_model_content jsonb NOT NULL DEFAULT '[]'::jsonb;
