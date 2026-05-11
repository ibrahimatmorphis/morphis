'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AuthResult {
  success?: boolean
  error?: string
}

/**
 * Validates password meets requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 */
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one digit'
  }
  return null
}

/**
 * Register a new user with email and password.
 * Creates the auth user via Supabase Auth and inserts into the users table
 * with the default role 'tenant_member'.
 */
export async function register(
  email: string,
  password: string
): Promise<AuthResult> {
  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: 'Registration failed' }
  }

  // Insert the user into the users table with default role
  const { error: insertError } = await supabase.from('users').insert({
    id: data.user.id,
    email: data.user.email!,
    role: 'tenant_member',
  })

  if (insertError) {
    return { error: 'Registration failed' }
  }

  return { success: true }
}

/**
 * Log in a user with email and password.
 * Authenticates via Supabase Auth and establishes a 1-hour session.
 * Returns generic error messages to avoid leaking email/password info.
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid credentials' }
  }

  // Check user role to determine redirect destination
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (userData?.role === 'superadmin') {
    redirect('/admin')
  }

  redirect('/dashboard')
}

/**
 * Send a password reset email.
 * Returns the same response regardless of whether the email exists
 * to prevent email enumeration.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient()

  // Always attempt the reset - Supabase won't reveal if email exists
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : ''}/auth/callback`,
  })

  // Return same response regardless of email existence
  return { success: true }
}

/**
 * Log out the current user by destroying their session.
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
