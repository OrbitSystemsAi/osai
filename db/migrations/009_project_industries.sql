CREATE TABLE IF NOT EXISTS project_industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(80) NOT NULL,
  normalized_name varchar(80) GENERATED ALWAYS AS (lower(trim(name))) STORED UNIQUE,
  image_url text NOT NULL DEFAULT '',
  brief_description varchar(300) NOT NULL DEFAULT '',
  long_description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
