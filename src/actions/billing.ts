'use server'

import { createClient } from '@/lib/supabase/server'
import { createPortalSession as createStripePortalSession } from '@/lib/stripe/portal'

/**
 * Create a Stripe Customer Portal session for the current tenant.
 * Fetches the tenant's stripe_customer_id, creates a portal session,
 * and returns the URL for redirect.
 * Only accessible to authenticated users with a tenant that has a Stripe customer ID.
 */
export async function createPortalSession(): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get user's tenant membership
  const { data: tenantUser, error: tenantUserError } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (tenantUserError || !tenantUser) {
    return { error: 'No tenant membership found' }
  }

  // Fetch the tenant's stripe_customer_id
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('stripe_customer_id')
    .eq('id', tenantUser.tenant_id)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Failed to fetch tenant information' }
  }

  if (!tenant.stripe_customer_id) {
    return { error: 'No billing account found. Please subscribe to a plan first.' }
  }

  // Create Stripe portal session
  try {
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`
    const session = await createStripePortalSession(
      tenant.stripe_customer_id,
      returnUrl
    )

    if (!session.url) {
      return { error: 'Failed to create billing portal session' }
    }

    return { url: session.url }
  } catch {
    return { error: 'Failed to connect to billing service. Please try again later.' }
  }
}
