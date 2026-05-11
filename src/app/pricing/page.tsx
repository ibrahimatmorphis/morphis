import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Check, X } from 'lucide-react'

const tiers = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For small teams getting started with AI UI injection.',
    popular: false,
    features: [
      '10,000 API calls/month',
      '3 Team members',
      '2 API keys',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'For growing teams that need more power and flexibility.',
    popular: true,
    features: [
      '100,000 API calls/month',
      '10 Team members',
      '5 API keys',
      'Priority support',
      'Custom SDK config',
    ],
  },
  {
    name: 'Enterprise',
    price: '$299',
    description: 'For large organizations with advanced requirements.',
    popular: false,
    features: [
      'Unlimited API calls',
      'Unlimited Team members',
      '10 API keys',
      'Priority support',
      'Custom SDK config',
      'SLA guarantee',
      'Dedicated account manager',
    ],
  },
]

const comparisonFeatures = [
  {
    name: 'API calls quota',
    starter: '10,000/mo',
    pro: '100,000/mo',
    enterprise: 'Unlimited',
  },
  {
    name: 'Team members',
    starter: '3',
    pro: '10',
    enterprise: 'Unlimited',
  },
  {
    name: 'API keys',
    starter: '2',
    pro: '5',
    enterprise: '10',
  },
  {
    name: 'Priority support',
    starter: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Custom SDK config',
    starter: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'SLA guarantee',
    starter: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'Dedicated account manager',
    starter: false,
    pro: false,
    enterprise: true,
  },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your team. Scale as you grow.
            </p>
          </div>
        </section>

        {/* Pricing Tier Cards */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-xl p-6 ring-1 ${
                  tier.popular
                    ? 'ring-2 ring-morphis-primary bg-card shadow-lg shadow-morphis-primary/10'
                    : 'ring-foreground/10 bg-card'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-morphis-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Check className="size-4 shrink-0 text-morphis-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    tier.popular
                      ? 'bg-morphis-primary text-primary-foreground hover:bg-morphis-primary/80'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Feature Comparison
          </h2>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-morphis-primary">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={
                      index < comparisonFeatures.length - 1
                        ? 'border-b border-border'
                        : ''
                    }
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ComparisonCell value={feature.starter} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ComparisonCell value={feature.pro} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ComparisonCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Comparison Cards */}
          <div className="space-y-6 md:hidden">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-4 ring-1 ${
                  tier.popular
                    ? 'ring-2 ring-morphis-primary'
                    : 'ring-foreground/10'
                }`}
              >
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {tier.name}
                  {tier.popular && (
                    <span className="ml-2 rounded-full bg-morphis-primary px-2 py-0.5 text-xs text-primary-foreground">
                      Popular
                    </span>
                  )}
                </h3>
                <ul className="space-y-2">
                  {comparisonFeatures.map((feature) => {
                    const value =
                      tier.name === 'Starter'
                        ? feature.starter
                        : tier.name === 'Pro'
                          ? feature.pro
                          : feature.enterprise
                    return (
                      <li
                        key={feature.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {feature.name}
                        </span>
                        <ComparisonCell value={value} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-foreground">{value}</span>
  }
  if (value) {
    return <Check className="mx-auto size-5 text-morphis-primary" />
  }
  return <X className="mx-auto size-5 text-muted-foreground/50" />
}
