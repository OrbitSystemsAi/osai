CREATE TABLE IF NOT EXISTS legal_project_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_by text NOT NULL REFERENCES user_profiles(auth_user_id),
  updated_by text NOT NULL REFERENCES user_profiles(auth_user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS legal_project_groups_project_idx
  ON legal_project_groups (project_id);

CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_group_id uuid NOT NULL REFERENCES legal_project_groups(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  document_type text NOT NULL DEFAULT 'Project legal document',
  mime_type text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  file_data bytea NOT NULL,
  uploaded_by text NOT NULL REFERENCES user_profiles(auth_user_id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS legal_documents_project_group_idx
  ON legal_documents (project_group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS legal_documents_uploaded_by_idx
  ON legal_documents (uploaded_by);

INSERT INTO legal_project_groups (project_id, title, created_by, updated_by)
SELECT id, name, created_by, updated_by
FROM projects
ON CONFLICT (project_id) DO UPDATE SET
  title = EXCLUDED.title,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();
