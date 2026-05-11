import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('[DASHBOARD-LAYOUT] auth.getUser:', { userId: user?.id, email: user?.email, authError: authError?.message })

  if (authError || !user) {
    console.log('[DASHBOARD-LAYOUT] No user, redirecting to login')
    redirect('/auth/login')
  }

  // Get the tenant name for this user
  const { data: tenantUser, error: tenantQueryError } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(name)')
    .eq('user_id', user.id)
    .single()

  console.log('[DASHBOARD-LAYOUT] tenant_users query:', { tenantUser, error: tenantQueryError?.message, code: tenantQueryError?.code })

  let tenantName = 'My Workspace'
  if (tenantUser?.tenants) {
    const tenants = tenantUser.tenants as unknown as { name: string } | { name: string }[]
    if (Array.isArray(tenants)) {
      tenantName = tenants[0]?.name ?? 'My Workspace'
    } else {
      tenantName = tenants.name
    }
  }

  return (
    <DashboardShell
      tenantName={tenantName}
      userEmail={user.email ?? ''}
    >
      {children}
    </DashboardShell>
  )
}
