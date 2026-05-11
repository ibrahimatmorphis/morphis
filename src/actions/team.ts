'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TeamMember } from '@/types'

type Role = 'tenant_owner' | 'tenant_member'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Get the current user's tenant context: user_id, tenant_id, and role.
 * Returns null if the user is not authenticated or has no tenant association.
 */
async function getCurrentUserTenantContext() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log('[TEAM] auth.getUser:', { userId: user?.id, email: user?.email, authError: authError?.message })

  if (authError || !user) {
    return null
  }

  const { data: tenantUser, error: tenantError } = await supabase
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  console.log('[TEAM] tenant_users query:', { tenantUser, tenantError: tenantError?.message, code: tenantError?.code })

  if (tenantError || !tenantUser) {
    return null
  }

  return {
    userId: user.id,
    tenantId: tenantUser.tenant_id as string,
    role: tenantUser.role as Role,
  }
}

/**
 * Invite a team member by email.
 * Creates a tenant_users mapping record with the default role 'tenant_member'.
 * Only tenant_owner can perform this action.
 */
export async function inviteTeamMember(
  email: string
): Promise<{ success: boolean } | { error: string }> {
  const context = await getCurrentUserTenantContext()
  if (!context) {
    return { error: 'Not authenticated' }
  }

  if (context.role !== 'tenant_owner') {
    return { error: 'Insufficient permissions. Only tenant owners can invite members.' }
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Invalid email format' }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Check if a user with this email already exists in the system
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    // Check if this user is already a member of this tenant
    const { data: existingMembership } = await supabase
      .from('tenant_users')
      .select('user_id')
      .eq('user_id', existingUser.id)
      .eq('tenant_id', context.tenantId)
      .single()

    if (existingMembership) {
      return { error: 'This user is already a member of your team' }
    }

    // User exists in the system but not in this tenant — add them
    const { error: insertError } = await adminClient
      .from('tenant_users')
      .insert({
        user_id: existingUser.id,
        tenant_id: context.tenantId,
        role: 'tenant_member',
      })

    if (insertError) {
      return { error: 'Failed to invite team member' }
    }
  } else {
    // User doesn't exist in the system — invite via Supabase Auth
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email)

    if (inviteError || !inviteData.user) {
      return { error: 'Failed to send invitation' }
    }

    // Create the users record for the invited user
    await adminClient.from('users').insert({
      id: inviteData.user.id,
      email,
      role: 'tenant_member',
    })

    // Create the tenant_users mapping
    const { error: insertError } = await adminClient
      .from('tenant_users')
      .insert({
        user_id: inviteData.user.id,
        tenant_id: context.tenantId,
        role: 'tenant_member',
      })

    if (insertError) {
      return { error: 'Failed to invite team member' }
    }
  }

  return { success: true }
}

/**
 * Update a team member's role.
 * Validates the role value and prevents removing the last tenant_owner.
 * Only tenant_owner can perform this action.
 */
export async function updateMemberRole(
  userId: string,
  role: Role
): Promise<{ success: boolean } | { error: string }> {
  const context = await getCurrentUserTenantContext()
  if (!context) {
    return { error: 'Not authenticated' }
  }

  if (context.role !== 'tenant_owner') {
    return { error: 'Insufficient permissions. Only tenant owners can change roles.' }
  }

  // Validate role value
  if (role !== 'tenant_owner' && role !== 'tenant_member') {
    return { error: 'Invalid role. Must be tenant_owner or tenant_member.' }
  }

  const supabase = await createClient()

  // If changing FROM tenant_owner, check if this is the last owner
  const { data: currentMember } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', context.tenantId)
    .single()

  if (!currentMember) {
    return { error: 'Member not found' }
  }

  if (currentMember.role === 'tenant_owner' && role === 'tenant_member') {
    // Count remaining owners
    const { count } = await supabase
      .from('tenant_users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', context.tenantId)
      .eq('role', 'tenant_owner')

    if (count !== null && count <= 1) {
      return { error: 'Cannot change role. At least one tenant owner is required.' }
    }
  }

  // Update the role
  const { error: updateError } = await supabase
    .from('tenant_users')
    .update({ role })
    .eq('user_id', userId)
    .eq('tenant_id', context.tenantId)

  if (updateError) {
    return { error: 'Failed to update member role' }
  }

  return { success: true }
}

/**
 * Remove a team member from the tenant.
 * Deletes the tenant_users mapping record.
 * Only tenant_owner can perform this action.
 * Cannot remove yourself if you're the last owner.
 */
export async function removeMember(
  userId: string
): Promise<{ success: boolean } | { error: string }> {
  const context = await getCurrentUserTenantContext()
  if (!context) {
    return { error: 'Not authenticated' }
  }

  if (context.role !== 'tenant_owner') {
    return { error: 'Insufficient permissions. Only tenant owners can remove members.' }
  }

  const supabase = await createClient()

  // Check if the user being removed is an owner
  const { data: memberToRemove } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', context.tenantId)
    .single()

  if (!memberToRemove) {
    return { error: 'Member not found' }
  }

  // If removing an owner, ensure they're not the last one
  if (memberToRemove.role === 'tenant_owner') {
    const { count } = await supabase
      .from('tenant_users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', context.tenantId)
      .eq('role', 'tenant_owner')

    if (count !== null && count <= 1) {
      return { error: 'Cannot remove the last tenant owner' }
    }
  }

  // Remove the tenant_users mapping
  const { error: deleteError } = await supabase
    .from('tenant_users')
    .delete()
    .eq('user_id', userId)
    .eq('tenant_id', context.tenantId)

  if (deleteError) {
    return { error: 'Failed to remove team member' }
  }

  return { success: true }
}

/**
 * List all team members for the current tenant.
 * Returns user_id, email, role, and joined_at for each member.
 */
export async function listTeamMembers(): Promise<
  { members: TeamMember[] } | { error: string }
> {
  const context = await getCurrentUserTenantContext()
  if (!context) {
    return { error: 'Not authenticated' }
  }

  const supabase = await createClient()

  // Fetch tenant_users joined with users table to get email
  const { data: members, error } = await supabase
    .from('tenant_users')
    .select(`
      user_id,
      role,
      joined_at,
      users!inner(email)
    `)
    .eq('tenant_id', context.tenantId)

  if (error) {
    return { error: 'Failed to load team members' }
  }

  const teamMembers: TeamMember[] = (members || []).map((member) => ({
    user_id: member.user_id as string,
    email: (member.users as unknown as { email: string }).email,
    role: member.role as 'tenant_owner' | 'tenant_member',
    joined_at: member.joined_at as string,
  }))

  return { members: teamMembers }
}
