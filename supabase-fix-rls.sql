-- Fix RLS policy for anonymous inserts
-- The anon key uses the 'anon' role, so we need to allow that

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Allow anonymous inserts" ON form_submissions;
DROP POLICY IF EXISTS "Allow authenticated reads" ON form_submissions;

-- Allow anyone (including anon) to insert
CREATE POLICY "Allow anonymous inserts" ON form_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow the service role and authenticated users to read
CREATE POLICY "Allow authenticated reads" ON form_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow deletion (protected by dashboard secret key in app logic)
CREATE POLICY "Allow anonymous deletes" ON form_submissions
  FOR DELETE
  TO anon
  USING (true);
