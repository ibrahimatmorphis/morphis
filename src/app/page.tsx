import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Logos } from "@/components/landing/logos"
import { Features } from "@/components/landing/features"
import { Showcase } from "@/components/landing/showcase"
import { Metrics } from "@/components/landing/metrics"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="bg-white overflow-hidden">
      <Navbar />
      <Hero />
      <Logos />
      <Features />
      <Showcase />
      <Metrics />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
