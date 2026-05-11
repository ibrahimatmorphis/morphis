"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { register } from "@/actions/auth"

function getPasswordStrength(password: string) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
  }
  return checks
}

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()
  const [registered, setRegistered] = useState(false)

  const strength = getPasswordStrength(password)
  const allValid =
    strength.minLength &&
    strength.hasUppercase &&
    strength.hasLowercase &&
    strength.hasDigit

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    startTransition(async () => {
      const result = await register(email, password)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Account created! Check your email to confirm.")
        setRegistered(true)
      }
    })
  }

  if (registered) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-white px-4">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(100 116 139 / 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(100 116 139 / 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-[#7BC53A] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 22V12" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Morphis</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Check Your Email</h1>
            <p className="text-slate-500 text-center text-sm mb-6">
              We&apos;ve sent a confirmation link to{" "}
              <span className="text-[#7BC53A] font-medium">{email}</span>.
              Please verify your email to activate your account.
            </p>

            <div className="flex justify-center">
              <Link
                href="/auth/login"
                className="text-[#7BC53A] hover:text-[#65A330] transition-colors font-medium text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(100 116 139 / 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(100 116 139 / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 5M5 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#7BC53A] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 22V12" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Morphis</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Create Account</h1>
          <p className="text-slate-500 text-center text-sm mb-6">Sign up for a Morphis account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7BC53A]/30 focus:border-[#7BC53A] transition-colors disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7BC53A]/30 focus:border-[#7BC53A] transition-colors disabled:opacity-50"
              />
              {password.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1 text-xs">
                  <li className={strength.minLength ? "text-[#7BC53A]" : "text-slate-400"}>
                    {strength.minLength ? "✓" : "○"} At least 8 characters
                  </li>
                  <li className={strength.hasUppercase ? "text-[#7BC53A]" : "text-slate-400"}>
                    {strength.hasUppercase ? "✓" : "○"} One uppercase letter
                  </li>
                  <li className={strength.hasLowercase ? "text-[#7BC53A]" : "text-slate-400"}>
                    {strength.hasLowercase ? "✓" : "○"} One lowercase letter
                  </li>
                  <li className={strength.hasDigit ? "text-[#7BC53A]" : "text-slate-400"}>
                    {strength.hasDigit ? "✓" : "○"} One digit
                  </li>
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={isPending || !allValid}
              className="w-full mt-2 px-6 py-3 bg-[#7BC53A] hover:bg-[#65A330] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex justify-center mt-6 text-sm">
            <p className="text-slate-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#7BC53A] hover:text-[#65A330] transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
