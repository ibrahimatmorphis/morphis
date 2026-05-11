import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

const teamMembers = [
  {
    name: 'Engineering',
    description:
      'Our engineering team builds the core hot-deploy infrastructure, ensuring sub-second UI injection with zero downtime across all client environments.',
  },
  {
    name: 'AI Research',
    description:
      'Our AI research team develops the intelligent component generation and placement algorithms that power the Morphis SDK.',
  },
  {
    name: 'Developer Experience',
    description:
      'Our DX team ensures that integrating Morphis into any stack is seamless — from documentation to SDK ergonomics.',
  },
]

export default function WhoWeArePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Who We Are
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              We&apos;re building the future of UI deployment — where AI meets
              infrastructure.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-morphis-primary sm:text-3xl">
                Our Mission
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Morphis exists to eliminate the friction between AI-generated UI
                and production deployment. We believe that updating a user
                interface should be as instant and safe as changing a
                configuration value — no CI/CD pipelines, no redeploys, no
                downtime.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-morphis-secondary sm:text-3xl">
                Our Vision
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                We envision a world where every application can adapt its
                interface in real-time through AI — securely, instantly, and at
                scale. Morphis is the infrastructure layer that makes this
                possible with a single Vanilla JS SDK integration.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
              Our Teams
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-morphis-primary"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-morphis-primary/20">
                    <span className="text-lg font-bold text-morphis-primary">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
              What Drives Us
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-morphis-accent">
                  Speed
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hot-deploy means instant. No waiting for builds, no queuing
                  deployments. Your UI updates the moment you decide it should.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-morphis-accent">
                  Security
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every injection is authenticated, scoped, and sandboxed. We
                  treat security as a first-class requirement, not an
                  afterthought.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-morphis-accent">
                  Simplicity
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  One SDK. One script tag. That&apos;s all it takes to bring
                  AI-powered UI updates to any web application.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-morphis-accent">
                  AI-First
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We don&apos;t bolt AI onto existing tools. Our entire
                  infrastructure is designed from the ground up for AI-generated
                  interfaces.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
