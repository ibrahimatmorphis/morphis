'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart3, Activity, Gauge, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getUsageStats } from '@/actions/usage'
import type { UsageStats } from '@/types'

export default function UsageStatsPage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getUsageStats()

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      toast.error('Could not load usage data', {
        description: result.error,
      })
      return
    }

    setStats(result.stats)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const allZero =
    stats !== null &&
    stats.totalCalls === 0 &&
    stats.currentPeriodCalls === 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#7BC53A]" />
        <p className="text-slate-500 text-sm">Loading usage statistics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-500 text-sm">
          Failed to load usage statistics.
        </p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#7BC53A]/30 text-[#7BC53A] rounded-lg hover:bg-[#7BC53A]/5 transition-colors text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usage Statistics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor your API consumption and quota usage.
        </p>
      </div>

      {allZero && (
        <div className="rounded-lg border border-[#7BC53A]/30 bg-[#7BC53A]/5 p-4">
          <p className="text-sm text-[#65A330]">
            No API calls have been made yet. Your usage statistics will appear here once you start using the API.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total API Calls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Total API Calls</span>
            <BarChart3 className="h-5 w-5 text-[#7BC53A]" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.totalCalls.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Lifetime usage</p>
        </div>

        {/* Current Period Calls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Current Period</span>
            <Activity className="h-5 w-5 text-[#7BC53A]" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.currentPeriodCalls.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">This billing period</p>
        </div>

        {/* Remaining Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Remaining Quota</span>
            <Gauge className="h-5 w-5 text-[#7BC53A]" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.remainingQuota.toLocaleString() ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Calls remaining</p>
        </div>
      </div>
    </div>
  )
}
