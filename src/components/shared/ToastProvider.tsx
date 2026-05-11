'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'

export function ToastProvider() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      duration={5000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group border border-border bg-card text-card-foreground shadow-lg rounded-lg',
          success:
            'border-morphis-primary/30 bg-morphis-primary/10 text-morphis-primary [&_[data-icon]]:text-morphis-primary',
          error:
            'border-destructive/30 bg-destructive/10 text-destructive [&_[data-icon]]:text-destructive',
          info: 'border-morphis-secondary/30 bg-morphis-secondary/10 text-morphis-secondary [&_[data-icon]]:text-morphis-secondary',
          warning:
            'border-yellow-500/30 bg-yellow-500/10 text-yellow-500 [&_[data-icon]]:text-yellow-500',
          description: 'text-muted-foreground',
          actionButton:
            'bg-morphis-primary text-morphis-primary-foreground hover:bg-morphis-primary/80',
          cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
        },
        // Success toasts have a minimum display of 4 seconds (4000ms)
        // Default duration is 5 seconds (5000ms) which satisfies both constraints
      }}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--card-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          '--success-bg': 'rgba(73, 212, 157, 0.1)',
          '--success-text': '#49D49D',
          '--success-border': 'rgba(73, 212, 157, 0.3)',
          '--error-bg': 'rgba(239, 68, 68, 0.1)',
          '--error-text': 'var(--destructive)',
          '--error-border': 'rgba(239, 68, 68, 0.3)',
        } as React.CSSProperties
      }
    />
  )
}
