import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Get user's tenant membership
  const { data: tenantUser, error: tenantUserError } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (tenantUserError || !tenantUser) {
    return NextResponse.json({ error: 'No tenant membership found' }, { status: 404 })
  }

  // Fetch the tenant's subscription info
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('name, subscription_status')
    .eq('id', tenantUser.tenant_id)
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Failed to fetch tenant information' }, { status: 500 })
  }

  return NextResponse.json({
    subscription_status: tenant.subscription_status || 'inactive',
    name: tenant.name,
  })
}
