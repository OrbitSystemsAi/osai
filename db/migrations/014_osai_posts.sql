CREATE TABLE IF NOT EXISTS osai_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_auth_user_id text NOT NULL REFERENCES user_profiles(auth_user_id) ON DELETE CASCADE,
  contributor_name text NOT NULL,
  section text NOT NULL DEFAULT 'OSai Briefing',
  title varchar(100) NOT NULL DEFAULT '',
  summary varchar(220) NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  topics text[] NOT NULL DEFAULT ARRAY[]::text[],
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  distribution jsonb NOT NULL DEFAULT '{"channels":["onn"],"audience":"public"}'::jsonb,
  submission_status text NOT NULL DEFAULT 'local_draft'
    CHECK (submission_status IN ('local_draft', 'submitting', 'submitted', 'failed')),
  onn_submission_id text,
  onn_content_id text,
  idempotency_key uuid NOT NULL DEFAULT gen_random_uuid(),
  submission_attempts integer NOT NULL DEFAULT 0,
  last_submission_error text,
  next_retry_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS osai_posts_author_updated_idx
  ON osai_posts (author_auth_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS osai_posts_retry_idx
  ON osai_posts (next_retry_at)
  WHERE submission_status = 'failed';

CREATE TABLE IF NOT EXISTS osai_post_submission_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES osai_posts(id) ON DELETE CASCADE,
  actor_auth_user_id text NOT NULL,
  attempt_number integer NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('started', 'submitted', 'failed')),
  response_status integer,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS osai_post_attempts_post_idx
  ON osai_post_submission_attempts (post_id, attempt_number DESC);
