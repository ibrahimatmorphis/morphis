'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createPortalSession } from '@/actions/billing'
import type { SubscriptionStatus } from '@/types'

interface TenantBillingInfo {
  subscription_status: SubscriptionStatus
  name: string
}

function getStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'bg-morphis-primary/20 text-morphis-primary border-morphis-primary/30'
    case 'past_due':
    case 'unpaid':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'canceled':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'inactive':
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function getStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'trialing':
      return 'Trialing'
    case 'past_due':
      return 'Past Due'
    case 'unpaid':
      return 'Unpaid'
    case 'canceled':
      return 'Canceled'
    case 'inactive':
    default:
      return 'Inactive'
  }
}

function getPlanName(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'unpaid':
      return 'Morphis Pro'
    case 'canceled':
      return 'Canceled Plan'
    case 'inactive':
    default:
      return 'No Active Plan'
  }
}

export default function BillingPage() {
  const [billingInfo, setBillingInfo] = useState<TenantBillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchBillingInfo() {
      try {
        const response = await fetch('/api/billing/info')
        if (!response.ok) {
          throw new Error('Failed to fetch billing info')
        }
        const data = await response.json()
        if (!cancelled) {
          setBillingInfo(data)
        }
      } catch {
        if (!cancelled) {
          setBillingInfo({ subscription_status: 'inactive', name: 'My Workspace' })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBillingInfo()

    return () => {
      cancelled = true
    }
  }, [])

  const handleManageBilling = async () => {
    setRedirecting(true)

    try {
      const result = await createPortalSession()

      if ('error' in result) {
        toast.error('Could not open billing portal', {
          description: result.error,
        })
        setRedirecting(false)
        return
      }

      // Redirect to Stripe Customer Portal
      window.location.href = result.url
    } catch {
      toast.error('Could not open billing portal', {
        description: 'An unexpected error occurred. Please try again.',
      })
      setRedirecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-morphis-primary" />
        <p className="text-muted-foreground text-sm">Loading billing information...</p>
      </div>
    )
  }

  const status = billingInfo?.subscription_status ?? 'inactive'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-morphis-primary" />
              <CardTitle className="text-lg">Current Plan</CardTitle>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>
          <CardDescription className="mt-2">
            {getPlanName(status)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              {status === 'active' && 'Your subscription is active. Manage your plan, payment methods, and invoices through the Stripe Customer Portal.'}
              {status === 'trialing' && 'You are currently on a trial. Manage your plan details through the Stripe Customer Portal.'}
              {status === 'past_due' && 'Your payment is past due. Please update your payment method to avoid service interruption.'}
              {status === 'unpaid' && 'Your subscription is unpaid. Please update your payment method.'}
              {status === 'canceled' && 'Your subscription has been canceled. You can resubscribe through the billing portal.'}
              {status === 'inactive' && 'You do not have an active subscription. Subscribe to a plan to get started.'}
            </div>

            <Button
              onClick={handleManageBilling}
              disabled={redirecting}
              className="w-fit gap-2 bg-morphis-primary text-black hover:bg-morphis-primary/80"
            >
              {redirecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
