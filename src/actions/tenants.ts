'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Tenant, TicketStatus } from '@/types'

const PAGE_SIZE = 50

/**
 * Verify the current user has the superadmin role.
 * Returns the user ID on success, or an error string.
 */
async function verifySuperadmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  const adminClient = createAdminClient()
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return { error: 'Failed to verify user role' }
  }

  if (userData.role !== 'superadmin') {
    return { error: 'Insufficient permissions. Superadmin access required.' }
  }

  return { userId: user.id }
}

/**
 * List all tenants with pagination (50 per page).
 * Returns tenant name, subscription_status, and stripe_customer_id.
 * Only accessible by superadmin users.
 */
export async function listTenants(page: number): Promise<{ tenants: Tenant[]; total: number } | { error: string }> {
  const authResult = await verifySuperadmin()
  if ('error' in authResult) {
    return { error: authResult.error }
  }

  const adminClient = createAdminClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Get total count
  const { count, error: countError } = await adminClient
    .from('tenants')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    return { error: 'Failed to fetch tenant count' }
  }

  // Get paginated tenants
  const { data: tenants, error: fetchError } = await adminClient
    .from('tenants')
    .select('id, name, stripe_customer_id, subscription_status, usage_limit')
    .order('name', { ascending: true })
    .range(from, to)

  if (fetchError) {
    return { error: 'Failed to fetch tenants' }
  }

  return { tenants: tenants as Tenant[], total: count ?? 0 }
}

/**
 * Update a tenant's usage limit.
 * Validates that the limit is a positive integer before updating.
 * Only accessible by superadmin users.
 */
export async function updateTenantUsageLimit(
  tenantId: string,
  limit: number
): Promise<{ success: boolean } | { error: string }> {
  const authResult = await verifySuperadmin()
  if ('error' in authResult) {
    return { error: authResult.error }
  }

  // Validate limit is a positive integer
  if (!Number.isInteger(limit) || limit <= 0) {
    return { error: 'Usage limit must be a positive integer' }
  }

  const adminClient = createAdminClient()

  const { data: updated, error: updateError } = await adminClient
    .from('tenants')
    .update({ usage_limit: limit })
    .eq('id', tenantId)
    .select('id')

  if (updateError) {
    return { error: 'Failed to update tenant usage limit' }
  }

  if (!updated || updated.length === 0) {
    return { error: 'Tenant not found' }
  }

  return { success: true }
}

/**
 * List all users with pagination (50 per page).
 * Returns email, role, and associated tenant name.
 * Only accessible by superadmin users.
 */
export async function listUsers(page: number): Promise<{
  users: { id: string; email: string; role: string; tenant_name: string | null }[];
  total: number;
} | { error: string }> {
  const authResult = await verifySuperadmin()
  if ('error' in authResult) {
    return { error: authResult.error }
  }

  const adminClient = createAdminClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Get total count
  const { count, error: countError } = await adminClient
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    return { error: 'Failed to fetch user count' }
  }

  // Get paginated users with their tenant association
  const { data: users, error: fetchError } = await adminClient
    .from('users')
    .select(`
      id,
      email,
      role,
      tenant_users (
        tenants (
          name
        )
      )
    `)
    .order('email', { ascending: true })
    .range(from, to)

  if (fetchError) {
    return { error: 'Failed to fetch users' }
  }

  // Transform the nested data to a flat structure
  const transformedUsers = (users ?? []).map((user: Record<string, unknown>) => {
    const tenantUsers = user.tenant_users as Array<{ tenants: { name: string } | null }> | null
    const tenantName = tenantUsers?.[0]?.tenants?.name ?? null
    return {
      id: user.id as string,
      email: user.email as string,
      role: user.role as string,
      tenant_name: tenantName,
    }
  })

  return { users: transformedUsers, total: count ?? 0 }
}

/**
 * List all support tickets with subject, tenant name, date, and status.
 * Only accessible by superadmin users.
 */
export async function listTickets(): Promise<{
  tickets: { id: string; subject: string | null; tenant_name: string | null; created_at: string; status: string }[];
} | { error: string }> {
  const authResult = await verifySuperadmin()
  if ('error' in authResult) {
    return { error: authResult.error }
  }

  const adminClient = createAdminClient()

  const { data: tickets, error: fetchError } = await adminClient
    .from('support_tickets')
    .select(`
      id,
      subject,
      status,
      created_at,
      tenants (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (fetchError) {
    return { error: 'Failed to fetch support tickets' }
  }

  const transformedTickets = (tickets ?? []).map((ticket: Record<string, unknown>) => {
    const tenants = ticket.tenants as { name: string } | null
    return {
      id: ticket.id as string,
      subject: ticket.subject as string | null,
      tenant_name: tenants?.name ?? null,
      created_at: ticket.created_at as string,
      status: ticket.status as string,
    }
  })

  return { tickets: transformedTickets }
}

/**
 * Update a support ticket's status.
 * Validates that the status is one of: open, in_progress, closed.
 * Only accessible by superadmin users.
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<{ success: boolean } | { error: string }> {
  const authResult = await verifySuperadmin()
  if ('error' in authResult) {
    return { error: authResult.error }
  }

  // Validate status value
  const validStatuses: TicketStatus[] = ['open', 'in_progress', 'closed']
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status. Must be one of: open, in_progress, closed' }
  }

  const adminClient = createAdminClient()

  const { data: updated, error: updateError } = await adminClient
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId)
    .select('id')

  if (updateError) {
    return { error: 'Failed to update ticket status' }
  }

  if (!updated || updated.length === 0) {
    return { error: 'Ticket not found' }
  }

  return { success: true }
}

/**
 * Get global subscription metrics.
 * Returns total active subscriptions count and monthly recurring revenue (MRR).
 * For MVP, MRR is calculated as active subscriptions × $49/month (fixed price).
 * Only accessible by superadmin users.
 */
export async function getMetrics(): Promise<{
  activeSubscriptions: number;
  mrr: number;
} | { error: string }> {
  const authResult = await verifySuperadmin()
  if ('error' in authResult) {
    return { error: authResult.error }
  }

  const adminClient = createAdminClient()

  // Count active subscriptions
  const { count, error: countError } = await adminClient
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')

  if (countError) {
    return { error: 'Failed to fetch subscription metrics' }
  }

  const activeSubscriptions = count ?? 0
  // For MVP, use a fixed price of $49/month per active subscription
  const mrr = activeSubscriptions * 49

  return { activeSubscriptions, mrr }
}
