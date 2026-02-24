-- =====================================================
-- DASHBOARD PERFORMANCE INDEXES (for 100k+ records)
-- Run this AFTER the base table already exists
-- =====================================================

-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes for fast ILIKE searches across key fields
CREATE INDEX IF NOT EXISTS idx_form_submissions_name_trgm ON form_submissions USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_form_submissions_business_trgm ON form_submissions USING GIN (business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email_trgm ON form_submissions USING GIN (email gin_trgm_ops);

-- Full-text search vector column and index for comprehensive search
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(business_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(passion, '') || ' ' ||
      coalesce(fun_fact, '') || ' ' ||
      coalesce(goals, '') || ' ' ||
      coalesce(connections, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_form_submissions_search ON form_submissions USING GIN (search_vector);

-- =====================================================
-- RPC FUNCTION: Paginated search for dashboard
-- =====================================================

CREATE OR REPLACE FUNCTION search_submissions(
  search_query TEXT DEFAULT '',
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 25
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_count INT;
  offset_val INT;
BEGIN
  offset_val := (page_number - 1) * page_size;

  IF search_query = '' OR search_query IS NULL THEN
    SELECT COUNT(*) INTO total_count FROM form_submissions;

    SELECT json_build_object(
      'data', COALESCE(json_agg(row_to_json(sub)), '[]'::json),
      'total', total_count,
      'page', page_number,
      'page_size', page_size,
      'total_pages', CEIL(total_count::float / page_size)
    ) INTO result
    FROM (
      SELECT id, name, phone, email, business_name, passion, fun_fact, goals, connections, submitted_at
      FROM form_submissions
      ORDER BY submitted_at DESC
      LIMIT page_size
      OFFSET offset_val
    ) sub;
  ELSE
    SELECT COUNT(*) INTO total_count
    FROM form_submissions
    WHERE
      name ILIKE '%' || search_query || '%'
      OR business_name ILIKE '%' || search_query || '%'
      OR email ILIKE '%' || search_query || '%'
      OR passion ILIKE '%' || search_query || '%'
      OR goals ILIKE '%' || search_query || '%'
      OR connections ILIKE '%' || search_query || '%';

    SELECT json_build_object(
      'data', COALESCE(json_agg(row_to_json(sub)), '[]'::json),
      'total', total_count,
      'page', page_number,
      'page_size', page_size,
      'total_pages', CEIL(total_count::float / page_size)
    ) INTO result
    FROM (
      SELECT id, name, phone, email, business_name, passion, fun_fact, goals, connections, submitted_at
      FROM form_submissions
      WHERE
        name ILIKE '%' || search_query || '%'
        OR business_name ILIKE '%' || search_query || '%'
        OR email ILIKE '%' || search_query || '%'
        OR passion ILIKE '%' || search_query || '%'
        OR goals ILIKE '%' || search_query || '%'
        OR connections ILIKE '%' || search_query || '%'
      ORDER BY submitted_at DESC
      LIMIT page_size
      OFFSET offset_val
    ) sub;
  END IF;

  RETURN result;
END;
$$;
