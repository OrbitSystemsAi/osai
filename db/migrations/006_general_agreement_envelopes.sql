CREATE TABLE IF NOT EXISTS agreement_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text NOT NULL REFERENCES user_profiles(auth_user_id) ON DELETE CASCADE,
  agreement_type text NOT NULL CHECK (agreement_type IN ('general_mnda')),
  agreement_version text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('docusign')),
  provider_envelope_id text NOT NULL UNIQUE,
  environment text NOT NULL CHECK (environment IN ('demo', 'production')),
  status text NOT NULL CHECK (status IN ('sent', 'completed', 'voided')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agreement_envelopes_member_status_idx
  ON agreement_envelopes (auth_user_id, agreement_type, environment, status, updated_at DESC);
