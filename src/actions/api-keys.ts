'use server'

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { ApiKey } from '@/types'

const MAX_API_KEYS = 10

/**
 * Generate a new API key for the current tenant.
 * Creates a 64-character hex key (32 random bytes), hashes it with SHA-256,
 * stores the hash in the api_keys table, and returns the plaintext key.
 * Only tenant_owner role can generate keys.
 */
export async function generateApiKey(): Promise<{ key: string } | { error: string }> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get user's tenant membership and role
  const { data: tenantUser, error: tenantUserError } = await supabase
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (tenantUserError || !tenantUser) {
    return { error: 'No tenant membership found' }
  }

  // Enforce tenant_owner role
  if (tenantUser.role !== 'tenant_owner') {
    return { error: 'Insufficient permissions. Only tenant owners can generate API keys.' }
  }

  // Check existing key count for the tenant
  const { count, error: countError } = await supabase
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantUser.tenant_id)

  if (countError) {
    return { error: 'Failed to check existing API keys' }
  }

  if ((count ?? 0) >= MAX_API_KEYS) {
    return { error: 'Maximum API key limit reached (10 keys). Delete an existing key to generate a new one.' }
  }

  // Generate the key: 32 random bytes → 64-char hex string
  const plainTextKey = crypto.randomBytes(32).toString('hex')

  // Hash the key with SHA-256 for storage
  const keyHash = crypto.createHash('sha256').update(plainTextKey).digest('hex')

  // Store the hashed key in the database
  const { error: insertError } = await supabase
    .from('api_keys')
    .insert({
      tenant_id: tenantUser.tenant_id,
      key_hash: keyHash,
    })

  if (insertError) {
    return { error: 'Failed to generate API key' }
  }

  return { key: plainTextKey }
}

/**
 * Delete an API key by its ID.
 * Only tenant_owner role can delete keys.
 * Ensures the key belongs to the user's tenant before deletion.
 */
export async function deleteApiKey(keyId: string): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get user's tenant membership and role
  const { data: tenantUser, error: tenantUserError } = await supabase
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (tenantUserError || !tenantUser) {
    return { error: 'No tenant membership found' }
  }

  // Enforce tenant_owner role
  if (tenantUser.role !== 'tenant_owner') {
    return { error: 'Insufficient permissions. Only tenant owners can delete API keys.' }
  }

  // Delete the key, ensuring it belongs to the user's tenant
  const { error: deleteError, count } = await supabase
    .from('api_keys')
    .delete({ count: 'exact' })
    .eq('id', keyId)
    .eq('tenant_id', tenantUser.tenant_id)

  if (deleteError) {
    return { error: 'Failed to delete API key' }
  }

  if (count === 0) {
    return { error: 'API key not found' }
  }

  return { success: true }
}

/**
 * List all API keys for the current tenant.
 * Returns keys ordered by creation date (newest first).
 * Any authenticated tenant member can list keys.
 */
export async function listApiKeys(): Promise<{ keys: ApiKey[] } | { error: string }> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[API-KEYS] auth.getUser:', { userId: user?.id, email: user?.email, authError: authError?.message })
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get user's tenant membership
  const { data: tenantUser, error: tenantUserError } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  console.log('[API-KEYS] tenant_users query:', { tenantUser, tenantUserError: tenantUserError?.message, code: tenantUserError?.code })
  if (tenantUserError || !tenantUser) {
    return { error: `No tenant membership found (${tenantUserError?.message || 'no rows'})` }
  }

  // Fetch all keys for the tenant, ordered by creation date descending
  const { data: keys, error: fetchError } = await supabase
    .from('api_keys')
    .select('id, tenant_id, key_hash, created_at')
    .eq('tenant_id', tenantUser.tenant_id)
    .order('created_at', { ascending: false })

  if (fetchError) {
    return { error: 'Failed to fetch API keys' }
  }

  return { keys: keys as ApiKey[] }
}
