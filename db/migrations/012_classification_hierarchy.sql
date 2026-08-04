ALTER TABLE project_classification_pages
  ADD COLUMN IF NOT EXISTS parent_name varchar(80) NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS project_classification_pages_parent_idx
  ON project_classification_pages (classification_type, lower(trim(parent_name)));
