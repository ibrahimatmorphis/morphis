-- ============================================================================
-- MORPHIS SEED DATA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create test users via Supabase Auth
-- NOTE: You must create users through the Supabase Dashboard or Auth API first.
-- Go to Authentication → Users → Add User for each:
--   1. admin@morphis.io (password: Admin123!)     → superadmin
--   2. owner@testcompany.com (password: Owner123!) → tenant_owner
--   3. member@testcompany.com (password: Member123!) → tenant_member
--
-- After creating them in Auth, copy their UUIDs and replace below.
-- OR use the script below which works if you already created them via Auth.
-- ============================================================================

-- STEP 2: Insert into our custom users table
-- Replace these UUIDs with the actual auth.users IDs from your Supabase Auth dashboard
-- You can find them at: Authentication → Users → click user → copy UUID

-- For now, we'll use a DO block that reads from auth.users
DO $$
DECLARE
  v_admin_id UUID;
  v_owner_id UUID;
  v_member_id UUID;
  v_tenant_id UUID;
BEGIN
  -- Get user IDs from auth.users (they must exist in Auth first!)
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@morphis.io' LIMIT 1;
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'owner@testcompany.com' LIMIT 1;
  SELECT id INTO v_member_id FROM auth.users WHERE email = 'member@testcompany.com' LIMIT 1;

  -- Bail if users don't exist in auth yet
  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'admin@morphis.io not found in auth.users. Create it first in the Auth dashboard.';
    RETURN;
  END IF;

  IF v_owner_id IS NULL THEN
    RAISE NOTICE 'owner@testcompany.com not found in auth.users. Create it first in the Auth dashboard.';
    RETURN;
  END IF;

  IF v_member_id IS NULL THEN
    RAISE NOTICE 'member@testcompany.com not found in auth.users. Create it first in the Auth dashboard.';
    RETURN;
  END IF;

  -- Insert into users table
  INSERT INTO public.users (id, email, role) VALUES
    (v_admin_id, 'admin@morphis.io', 'superadmin'),
    (v_owner_id, 'owner@testcompany.com', 'tenant_owner'),
    (v_member_id, 'member@testcompany.com', 'tenant_member')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- Create a test tenant
  INSERT INTO public.tenants (id, name, subscription_status, usage_limit)
  VALUES (gen_random_uuid(), 'Test Company', 'active', 5000)
  RETURNING id INTO v_tenant_id;

  -- Map users to tenant
  INSERT INTO public.tenant_users (user_id, tenant_id, role) VALUES
    (v_owner_id, v_tenant_id, 'tenant_owner'),
    (v_member_id, v_tenant_id, 'tenant_member')
  ON CONFLICT DO NOTHING;

  -- Also add admin to the tenant (so they can see it from dashboard too)
  INSERT INTO public.tenant_users (user_id, tenant_id, role) VALUES
    (v_admin_id, v_tenant_id, 'tenant_owner')
  ON CONFLICT DO NOTHING;

  -- Create a sample support ticket
  INSERT INTO public.support_tickets (tenant_id, subject, status) VALUES
    (v_tenant_id, 'How do I integrate the SDK?', 'open'),
    (v_tenant_id, 'Billing question about Pro plan', 'in_progress');

  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Admin ID: %', v_admin_id;
  RAISE NOTICE 'Owner ID: %', v_owner_id;
  RAISE NOTICE 'Member ID: %', v_member_id;
  RAISE NOTICE 'Tenant ID: %', v_tenant_id;
END $$;
