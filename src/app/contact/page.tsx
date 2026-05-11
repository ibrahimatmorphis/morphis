'use client'

import { useState, type FormEvent } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Validate inputs
    if (!name.trim()) {
      toast.error('Please enter your name.')
      return
    }

    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (!message.trim()) {
      toast.error('Please enter a message.')
      return
    }

    setIsSubmitting(true)

    // Simulate form submission (MVP — no actual email sending)
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast.success('Message sent successfully! We will get back to you soon.')
    setName('')
    setEmail('')
    setMessage('')
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Have a question or want to learn more about Morphis? Send us a
              message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="h-10"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-10"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px] resize-y"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-morphis-primary text-morphis-primary-foreground hover:bg-morphis-primary/80 h-10 text-base font-medium"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
