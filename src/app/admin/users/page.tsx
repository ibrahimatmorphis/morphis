'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { listUsers } from '@/actions/tenants'
import { Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

type UserRow = {
  id: string
  email: string
  role: string
  tenant_name: string | null
}

const PAGE_SIZE = 50

function RoleBadge({ role }: { role: string }) {
  let classes = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium '

  switch (role) {
    case 'superadmin':
      classes += 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      break
    case 'tenant_owner':
      classes += 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      break
    default:
      classes += 'bg-muted text-muted-foreground border border-border'
      break
  }

  const label = role === 'tenant_owner' ? 'Owner' : role === 'superadmin' ? 'Superadmin' : 'Member'

  return <span className={classes}>{label}</span>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      setLoading(true)
      const result = await listUsers(page)

      if (cancelled) return

      if ('error' in result) {
        toast.error('Failed to load users', {
          description: result.error,
        })
        setLoading(false)
        return
      }

      setUsers(result.users)
      setTotal(result.total)
      setLoading(false)
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [page])

  function handlePrevious() {
    if (page > 1) {
      setPage((p) => p - 1)
    }
  }

  function handleNext() {
    if (page < totalPages) {
      setPage((p) => p + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="size-6 text-morphis-primary" />
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 border-b border-border px-4 py-3 text-sm font-medium text-muted-foreground">
          <span>Email</span>
          <span>Role</span>
          <span>Tenant</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-morphis-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            No users found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-3 sm:items-center sm:gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-sm font-medium truncate">{user.email}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground sm:hidden mr-2">Role:</span>
                  <RoleBadge role={user.role} />
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  <span className="text-xs text-muted-foreground sm:hidden mr-2">Tenant:</span>
                  {user.tenant_name ?? '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={page <= 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={page >= totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
