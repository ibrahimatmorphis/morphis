'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { listTickets, updateTicketStatus } from '@/actions/tenants'
import type { TicketStatus } from '@/types'
import { LifeBuoy } from 'lucide-react'

interface Ticket {
  id: string
  subject: string | null
  tenant_name: string | null
  created_at: string
  status: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Open'
    case 'in_progress':
      return 'In Progress'
    case 'closed':
      return 'Closed'
    default:
      return status
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'text-yellow-400'
    case 'in_progress':
      return 'text-morphis-secondary'
    case 'closed':
      return 'text-muted-foreground'
    default:
      return 'text-foreground'
  }
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const result = await listTickets()
    if ('error' in result) {
      toast.error(result.error)
    } else {
      setTickets(result.tickets)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  async function handleStatusChange(ticketId: string, newStatus: string) {
    setUpdatingId(ticketId)
    const result = await updateTicketStatus(ticketId, newStatus as TicketStatus)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Ticket status updated')
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      )
    }
    setUpdatingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LifeBuoy className="size-6 text-morphis-primary" />
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            All Tickets ({tickets.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-morphis-primary border-t-transparent" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            No support tickets found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table header - visible on sm+ */}
            <div className="hidden px-4 py-2 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-4 sm:gap-4">
              <span>Subject</span>
              <span>Tenant</span>
              <span>Created</span>
              <span>Status</span>
            </div>

            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col gap-3 px-4 py-3 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4"
              >
                {/* Subject */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground sm:hidden">
                    Subject
                  </span>
                  <span className="text-sm font-medium">
                    {ticket.subject ?? 'No subject'}
                  </span>
                </div>

                {/* Tenant Name */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground sm:hidden">
                    Tenant
                  </span>
                  <span className="text-sm">
                    {ticket.tenant_name ?? 'Unknown'}
                  </span>
                </div>

                {/* Created Date */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground sm:hidden">
                    Created
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>

                {/* Status Dropdown */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground sm:hidden">
                    Status
                  </span>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) =>
                      handleStatusChange(ticket.id, value as string)
                    }
                  >
                    <SelectTrigger
                      className="w-[140px]"
                      disabled={updatingId === ticket.id}
                    >
                      <span className={statusColor(ticket.status)}>●</span>
                      <SelectValue>
                        {statusLabel(ticket.status)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
