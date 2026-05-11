import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/shared";
import { validateEnv } from "@/lib/env";

// Validate environment variables at server startup
// In production: throw to prevent running without credentials
// In development: warn but allow the app to start (landing pages work without Supabase)
if (process.env.NEXT_PHASE !== "phase-production-build") {
  try {
    validateEnv();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      throw e;
    }
    // In dev, the error is already logged by validateEnv() — just continue
  }
}

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Morphis - AI-First Hot-Deploy UI Infrastructure",
  description:
    "Secure, instant AI UI injection without CI/CD redeploys via Vanilla JS SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baloo2.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
