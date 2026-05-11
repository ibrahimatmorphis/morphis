import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Logos } from "@/components/logos"
import { Features } from "@/components/features"
import { Showcase } from "@/components/showcase"
import { Metrics } from "@/components/metrics"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

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
