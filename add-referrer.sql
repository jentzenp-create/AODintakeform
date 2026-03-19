-- Run this in your Supabase SQL Editor to add the 'referrer' column and update the search.

-- 1. Add the referrer column
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS referrer TEXT;

-- 2. Update the RPC function to support the new parameter
CREATE OR REPLACE FUNCTION search_submissions(
  search_query TEXT DEFAULT '',
  referrer_filter TEXT DEFAULT '',
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

  IF (search_query = '' OR search_query IS NULL) AND (referrer_filter = '' OR referrer_filter IS NULL) THEN
    -- No search and no referrer filter, return all paginated
    SELECT COUNT(*) INTO total_count FROM form_submissions;

    SELECT json_build_object(
      'data', COALESCE(json_agg(row_to_json(sub)), '[]'::json),
      'total', total_count,
      'page', page_number,
      'page_size', page_size,
      'total_pages', CEIL(total_count::float / page_size)
    ) INTO result
    FROM (
      SELECT id, name, phone, email, business_name, passion, fun_fact, goals, connections, referrer, submitted_at
      FROM form_submissions
      ORDER BY submitted_at DESC
      LIMIT page_size
      OFFSET offset_val
    ) sub;
  ELSE
    -- Search with trigram matching across key fields and referrer filter
    SELECT COUNT(*) INTO total_count
    FROM form_submissions
    WHERE
      (referrer_filter = '' OR referrer_filter IS NULL OR referrer = referrer_filter)
      AND (
        search_query = '' OR search_query IS NULL 
        OR name ILIKE '%' || search_query || '%'
        OR business_name ILIKE '%' || search_query || '%'
        OR email ILIKE '%' || search_query || '%'
        OR passion ILIKE '%' || search_query || '%'
        OR goals ILIKE '%' || search_query || '%'
        OR connections ILIKE '%' || search_query || '%'
        OR referrer ILIKE '%' || search_query || '%'
      );

    SELECT json_build_object(
      'data', COALESCE(json_agg(row_to_json(sub)), '[]'::json),
      'total', total_count,
      'page', page_number,
      'page_size', page_size,
      'total_pages', CEIL(total_count::float / page_size)
    ) INTO result
    FROM (
      SELECT id, name, phone, email, business_name, passion, fun_fact, goals, connections, referrer, submitted_at
      FROM form_submissions
      WHERE
        (referrer_filter = '' OR referrer_filter IS NULL OR referrer = referrer_filter)
        AND (
          search_query = '' OR search_query IS NULL 
          OR name ILIKE '%' || search_query || '%'
          OR business_name ILIKE '%' || search_query || '%'
          OR email ILIKE '%' || search_query || '%'
          OR passion ILIKE '%' || search_query || '%'
          OR goals ILIKE '%' || search_query || '%'
          OR connections ILIKE '%' || search_query || '%'
          OR referrer ILIKE '%' || search_query || '%'
        )
      ORDER BY submitted_at DESC
      LIMIT page_size
      OFFSET offset_val
    ) sub;
  END IF;

  RETURN result;
END;
$$;
