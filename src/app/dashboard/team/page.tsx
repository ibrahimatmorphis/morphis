'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  inviteTeamMember,
  updateMemberRole,
  removeMember,
  listTeamMembers,
} from '@/actions/team'
import type { TeamMember } from '@/types'
import { UserPlus, Trash2, Shield, Users } from 'lucide-react'

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const result = await listTeamMembers()
    if ('error' in result) {
      toast.error(result.error)
    } else {
      setMembers(result.members)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()

    const email = inviteEmail.trim()
    if (!email) return

    setInviting(true)
    const result = await inviteTeamMember(email)

    if ('error' in result) {
      // Determine toast type based on error message
      if (result.error === 'This user is already a member of your team') {
        toast.info(result.error)
      } else if (result.error === 'Invalid email format') {
        toast.error('Invalid email format')
      } else if (result.error.includes('Insufficient permissions')) {
        toast.error('Insufficient permissions')
      } else {
        toast.error(result.error)
      }
    } else {
      toast.success('Team member invited')
      setInviteEmail('')
      await fetchMembers()
    }
    setInviting(false)
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const role = newRole as 'tenant_owner' | 'tenant_member'
    const result = await updateMemberRole(userId, role)

    if ('error' in result) {
      if (result.error.includes('At least one tenant owner')) {
        toast.error('Cannot change role. At least one tenant owner is required.')
      } else if (result.error.includes('Insufficient permissions')) {
        toast.error('Insufficient permissions')
      } else {
        toast.error(result.error)
      }
    } else {
      toast.success('Role updated')
      await fetchMembers()
    }
  }

  function handleRemoveClick(member: TeamMember) {
    setMemberToRemove(member)
    setConfirmRemoveOpen(true)
  }

  async function handleConfirmRemove() {
    if (!memberToRemove) return

    setRemovingId(memberToRemove.user_id)
    setConfirmRemoveOpen(false)

    const result = await removeMember(memberToRemove.user_id)

    if ('error' in result) {
      if (result.error.includes('Insufficient permissions')) {
        toast.error('Insufficient permissions')
      } else {
        toast.error(result.error)
      }
    } else {
      toast.success('Team member removed')
      await fetchMembers()
    }

    setRemovingId(null)
    setMemberToRemove(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="size-6 text-morphis-primary" />
        <h1 className="text-2xl font-bold">Team Management</h1>
      </div>

      {/* Invite Form */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Invite a new team member
        </h2>
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
            disabled={inviting}
          />
          <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
            <UserPlus className="size-4" data-icon="inline-start" />
            Invite
          </Button>
        </form>
      </div>

      {/* Team Member List */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Team Members ({members.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-morphis-primary border-t-transparent" />
          </div>
        ) : members.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            No team members yet. Invite someone to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{member.email}</span>
                  <span className="text-xs text-muted-foreground">
                    Joined {formatJoinDate(member.joined_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role Badge / Dropdown */}
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      handleRoleChange(member.user_id, value as string)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <Shield className="size-3.5 text-morphis-primary" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant_owner">Owner</SelectItem>
                      <SelectItem value="tenant_member">Member</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveClick(member)}
                    disabled={removingId === member.user_id}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium text-foreground">
                {memberToRemove?.email}
              </span>{' '}
              from your team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmRemove}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
