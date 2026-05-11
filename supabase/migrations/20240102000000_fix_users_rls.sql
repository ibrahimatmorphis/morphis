-- Allow users to read their own row from the users table
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (id = auth.uid());
