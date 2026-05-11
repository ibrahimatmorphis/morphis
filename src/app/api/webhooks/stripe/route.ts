import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'
import type { SubscriptionStatus } from '@/types/database'

const relevantEvents = new Set([
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.created',
])

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'trialing':
      return 'trialing'
    case 'unpaid':
      return 'unpaid'
    case 'canceled':
      return 'canceled'
    default:
      return 'inactive'
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Stripe webhook error: Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe webhook signature verification failed: ${message}`)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  const supabase = createAdminClient()

  // Look up the tenant by stripe_customer_id
  const { data: tenant, error: lookupError } = await supabase
    .from('tenants')
    .select('id, stripe_customer_id')
    .eq('stripe_customer_id', customerId)
    .single()

  // Handle subscription created — store stripe_customer_id if not yet stored
  if (event.type === 'customer.subscription.created' && !tenant) {
    // For first subscription creation, we need to find the tenant by another means
    // The stripe_customer_id should have been stored when the customer was created
    // If no tenant matches, log and return 200
    console.log(
      `Stripe webhook: No tenant found for customer ${customerId} on subscription.created event`
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (lookupError || !tenant) {
    console.log(
      `Stripe webhook: No tenant found for stripe_customer_id ${customerId}. Event: ${event.type}`
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // Handle customer.subscription.deleted
  if (event.type === 'customer.subscription.deleted') {
    const { error: updateError } = await supabase
      .from('tenants')
      .update({ subscription_status: 'canceled' })
      .eq('id', tenant.id)

    if (updateError) {
      console.error(
        `Stripe webhook: Failed to update tenant ${tenant.id} subscription status to canceled:`,
        updateError.message
      )
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ received: true }, { status: 200 })
  }

  // Handle customer.subscription.updated and customer.subscription.created
  const newStatus = mapStripeStatus(subscription.status)

  const updateData: Record<string, string> = {
    subscription_status: newStatus,
  }

  // Store stripe_customer_id if not already set
  if (!tenant.stripe_customer_id) {
    updateData.stripe_customer_id = customerId
  }

  const { error: updateError } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', tenant.id)

  if (updateError) {
    console.error(
      `Stripe webhook: Failed to update tenant ${tenant.id}:`,
      updateError.message
    )
    return NextResponse.json(
      { error: 'Failed to update subscription status' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
