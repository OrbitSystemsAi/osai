ALTER TABLE project_industries
  ADD COLUMN IF NOT EXISTS brief_description varchar(300) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS long_description text NOT NULL DEFAULT '';
