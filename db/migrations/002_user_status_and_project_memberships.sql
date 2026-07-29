ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending_approval', 'approved', 'declined', 'revoked'));

CREATE TABLE IF NOT EXISTS project_memberships (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  auth_user_id text NOT NULL REFERENCES user_profiles(auth_user_id) ON DELETE CASCADE,
  project_role text NOT NULL DEFAULT 'participant',
  status text NOT NULL DEFAULT 'project_review_pending'
    CHECK (status IN ('project_access_requested', 'project_review_pending', 'project_information_required', 'project_agreement_pending', 'project_agreement_signed', 'project_access_approved', 'project_access_declined', 'project_access_revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, auth_user_id)
);

CREATE INDEX IF NOT EXISTS project_memberships_auth_user_idx ON project_memberships (auth_user_id);
