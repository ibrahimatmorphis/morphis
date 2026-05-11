'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listTenants, updateTenantUsageLimit, getMetrics } from '@/actions/tenants'
import type { Tenant } from '@/types'
import {
  Loader2,
  CreditCard,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react'

const PAGE_SIZE = 50

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<{ activeSubscriptions: number; mrr: number } | null>(null)
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchTenants = useCallback(async (p: number) => {
    setLoading(true)
    const result = await listTenants(p)
    if ('error' in result) {
      toast.error('Failed to load tenants', { description: result.error })
    } else {
      setTenants(result.tenants)
      setTotal(result.total)
    }
    setLoading(false)
  }, [])

  const fetchMetrics = useCallback(async () => {
    const result = await getMetrics()
    if ('error' in result) {
      toast.error('Failed to load metrics', { description: result.error })
    } else {
      setMetrics(result)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    fetchTenants(page)
  }, [page, fetchTenants])

  function handleEditStart(tenant: Tenant) {
    setEditingTenantId(tenant.id)
    setEditValue(String(tenant.usage_limit))
  }

  function handleEditCancel() {
    setEditingTenantId(null)
    setEditValue('')
  }

  async function handleEditSave(tenantId: string) {
    const parsed = parseInt(editValue, 10)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      toast.error('Invalid usage limit', {
        description: 'Usage limit must be a positive integer.',
      })
      return
    }

    setSaving(true)
    const result = await updateTenantUsageLimit(tenantId, parsed)

    if ('error' in result) {
      toast.error('Failed to update usage limit', { description: result.error })
    } else {
      toast.success('Usage limit updated')
      // Update local state
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, usage_limit: parsed } : t))
      )
      setEditingTenantId(null)
      setEditValue('')
    }
    setSaving(false)
  }

  function handleKeyDown(e: React.KeyboardEvent, tenantId: string) {
    if (e.key === 'Enter') {
      handleEditSave(tenantId)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      active: 'bg-morphis-primary/10 text-morphis-primary border-morphis-primary/30',
      past_due: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      trialing: 'bg-morphis-secondary/10 text-morphis-secondary border-morphis-secondary/30',
      unpaid: 'bg-red-500/10 text-red-500 border-red-500/30',
      canceled: 'bg-muted text-muted-foreground border-border',
      inactive: 'bg-muted text-muted-foreground border-border',
    }
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.inactive}`}
      >
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage all platform tenants and subscription metrics.
        </p>
      </div>

      {/* Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-5 w-5 text-morphis-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-morphis-primary">
              {metrics?.activeSubscriptions ?? '—'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MRR
            </CardTitle>
            <DollarSign className="h-5 w-5 text-morphis-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-morphis-secondary">
              {metrics ? `$${metrics.mrr.toLocaleString()}` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Stripe Customer ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Usage Limit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-morphis-primary" />
                      <span className="text-muted-foreground">Loading tenants...</span>
                    </div>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    No tenants found.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {tenant.name}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(tenant.subscription_status)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {tenant.stripe_customer_id ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {editingTenantId === tenant.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={1}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, tenant.id)}
                            onBlur={() => handleEditSave(tenant.id)}
                            className="h-8 w-24"
                            autoFocus
                            disabled={saving}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-morphis-primary hover:bg-morphis-primary/10"
                            onClick={() => handleEditSave(tenant.id)}
                            disabled={saving}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:bg-muted"
                            onClick={handleEditCancel}
                            disabled={saving}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditStart(tenant)}
                          className="rounded px-2 py-1 text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                          title="Click to edit usage limit"
                        >
                          {tenant.usage_limit.toLocaleString()}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
