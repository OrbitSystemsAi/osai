INSERT INTO project_classification_pages (classification_type, name, parent_name, updated_at)
SELECT 'category', min(trim(category)), min(trim(industry)), now()
FROM projects
WHERE trim(category) <> '' AND trim(industry) <> ''
GROUP BY lower(trim(category))
ON CONFLICT (classification_type, normalized_name)
DO UPDATE SET parent_name = CASE
  WHEN trim(project_classification_pages.parent_name) = '' THEN EXCLUDED.parent_name
  ELSE project_classification_pages.parent_name
END;

INSERT INTO project_classification_pages (classification_type, name, parent_name, updated_at)
SELECT 'subcategory', min(trim(sub_category)), min(trim(category)), now()
FROM projects
WHERE trim(sub_category) <> '' AND trim(category) <> ''
GROUP BY lower(trim(sub_category))
ON CONFLICT (classification_type, normalized_name)
DO UPDATE SET parent_name = CASE
  WHEN trim(project_classification_pages.parent_name) = '' THEN EXCLUDED.parent_name
  ELSE project_classification_pages.parent_name
END;
