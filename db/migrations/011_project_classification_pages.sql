CREATE TABLE IF NOT EXISTS project_classification_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classification_type varchar(20) NOT NULL CHECK (classification_type IN ('category', 'subcategory')),
  name varchar(80) NOT NULL,
  normalized_name varchar(80) GENERATED ALWAYS AS (lower(trim(name))) STORED,
  image_url text NOT NULL DEFAULT '',
  brief_description varchar(300) NOT NULL DEFAULT '',
  long_description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (classification_type, normalized_name)
);
