-- Fix infinite recursion in RLS policies
-- The superadmin policies check the users table, which itself has RLS enabled,
-- causing infinite recursion. Fix: use auth.jwt() to check role from the JWT token
-- instead of querying the users table.

-- Drop all existing superadmin policies
DROP POLICY IF EXISTS superadmin_full_access ON users;
DROP POLICY IF EXISTS superadmin_full_access ON tenants;
DROP POLICY IF EXISTS superadmin_full_access ON tenant_users;
DROP POLICY IF EXISTS superadmin_full_access ON api_keys;
DROP POLICY IF EXISTS superadmin_full_access ON support_tickets;

-- Drop the users_read_own policy too (we'll recreate it)
DROP POLICY IF EXISTS users_read_own ON users;

-- Users table: allow users to read their own row (simple, no recursion)
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users table: allow users to insert their own row (for registration)
CREATE POLICY users_insert_own ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Superadmin policies: use a subquery with SECURITY DEFINER function to avoid recursion
-- First, create a helper function that bypasses RLS to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

-- Now create superadmin policies using the function (no recursion since function is SECURITY DEFINER)
CREATE POLICY superadmin_full_access ON users
  FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY superadmin_full_access ON tenants
  FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY superadmin_full_access ON tenant_users
  FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY superadmin_full_access ON api_keys
  FOR SELECT
  USING (public.is_superadmin());

CREATE POLICY superadmin_full_access ON support_tickets
  FOR SELECT
  USING (public.is_superadmin());

-- Also fix: superadmin should be able to manage support tickets
CREATE POLICY superadmin_manage_tickets ON support_tickets
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
