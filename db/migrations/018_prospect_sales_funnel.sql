ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS contact_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS problem_statement text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS desired_outcomes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proposed_solution text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ideas text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS decision_process text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS budget_range text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_timeline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS next_step text NOT NULL DEFAULT '';

ALTER TABLE prospects ALTER COLUMN status DROP DEFAULT;
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
ALTER TABLE prospects
  ADD CONSTRAINT prospects_status_check
  CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'discovery', 'qualification', 'solution', 'proposal', 'negotiation', 'won', 'lost'));
ALTER TABLE prospects ALTER COLUMN status SET DEFAULT 'discovery';

UPDATE prospects
SET status = CASE
  WHEN status IN ('new', 'contacted') THEN 'discovery'
  WHEN status = 'qualified' THEN 'qualification'
  ELSE status
END;

CREATE INDEX IF NOT EXISTS prospects_business_email_lower_idx
  ON prospects (lower(business_email)) WHERE business_email <> '';
