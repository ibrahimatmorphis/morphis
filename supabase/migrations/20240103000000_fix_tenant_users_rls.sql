-- Fix circular RLS policy on tenant_users table
-- The old policy checked tenant_users to authorize access to tenant_users (circular)
-- New policy: users can access rows where they are the user_id

DROP POLICY IF EXISTS own_tenant_access ON tenant_users;

CREATE POLICY own_tenant_access ON tenant_users
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
