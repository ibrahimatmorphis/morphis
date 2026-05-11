'use server'

import { createClient } from '@/lib/supabase/server'
import type { UsageStats } from '@/types'

export async function getUsageStats(): Promise<{ stats: UsageStats } | { error: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('[USAGE] auth.getUser result:', { userId: user?.id, email: user?.email, authError: authError?.message })

    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    const { data: tenantUser, error: tenantUserError } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    console.log('[USAGE] tenant_users query:', { tenantUser, tenantUserError: tenantUserError?.message, tenantUserCode: tenantUserError?.code })

    if (tenantUserError || !tenantUser) {
      return { error: `Could not determine your organization (${tenantUserError?.message || 'no rows'})` }
    }

    const tenantId = tenantUser.tenant_id

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('usage_limit')
      .eq('id', tenantId)
      .single()

    console.log('[USAGE] tenants query:', { tenant, tenantError: tenantError?.message })

    if (tenantError || !tenant) {
      return { error: 'Could not load usage data' }
    }

    const usageLimit = tenant.usage_limit ?? 1000

    const { count: totalCalls, error: totalError } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    console.log('[USAGE] api_keys total count:', { totalCalls, totalError: totalError?.message })

    if (totalError) {
      return { error: 'Could not load usage data' }
    }

    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count: currentPeriodCalls, error: periodError } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', periodStart)

    if (periodError) {
      return { error: 'Could not load usage data' }
    }

    const total = totalCalls ?? 0
    const periodCalls = currentPeriodCalls ?? 0
    const remaining = Math.max(0, usageLimit - periodCalls)

    const stats: UsageStats = {
      totalCalls: total,
      currentPeriodCalls: periodCalls,
      remainingQuota: remaining,
    }

    console.log('[USAGE] Success:', stats)
    return { stats }
  } catch (err) {
    console.error('[USAGE] Unexpected error:', err)
    return { error: 'Could not load usage data' }
  }
}
