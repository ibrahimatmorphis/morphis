'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Key, Plus, Copy, Trash2, X, AlertTriangle } from 'lucide-react'
import { generateApiKey, deleteApiKey, listApiKeys } from '@/actions/api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ApiKey } from '@/types'

const MAX_KEYS = 10

function maskKey(keyHash: string): string {
  if (keyHash.length <= 12) return keyHash
  return `${keyHash.slice(0, 8)}...${keyHash.slice(-4)}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    const result = await listApiKeys()
    if ('error' in result) {
      toast.error(result.error)
    } else {
      setKeys(result.keys)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleGenerate = async () => {
    setGenerating(true)
    const result = await generateApiKey()
    if ('error' in result) {
      if (result.error.includes('Insufficient permissions')) {
        toast.error('Insufficient permissions. Only tenant owners can generate API keys.')
      } else {
        toast.error(result.error)
      }
    } else {
      setNewKey(result.key)
      toast.success('API key created')
      await fetchKeys()
    }
    setGenerating(false)
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Key copied to clipboard')
    } catch {
      toast.error('Failed to copy key to clipboard')
    }
  }

  const handleDeleteClick = (keyId: string) => {
    setKeyToDelete(keyId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!keyToDelete) return
    setDeleting(true)
    const result = await deleteApiKey(keyToDelete)
    if ('error' in result) {
      if (result.error.includes('Insufficient permissions')) {
        toast.error('Insufficient permissions. Only tenant owners can delete API keys.')
      } else {
        toast.error(result.error)
      }
    } else {
      toast.success('API key deleted')
      await fetchKeys()
    }
    setDeleting(false)
    setDeleteDialogOpen(false)
    setKeyToDelete(null)
  }

  const isAtLimit = keys.length >= MAX_KEYS

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Morphis SDK API keys
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleGenerate}
            disabled={isAtLimit || generating}
            size="lg"
          >
            <Plus data-icon="inline-start" className="size-4" />
            {generating ? 'Generating...' : 'Generate Key'}
          </Button>
          {isAtLimit && (
            <span className="text-xs text-destructive">
              Key limit reached (max {MAX_KEYS})
            </span>
          )}
        </div>
      </div>

      {/* Newly generated key display */}
      {newKey && (
        <div className="rounded-lg border border-morphis-primary/30 bg-morphis-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-morphis-primary">
              New API Key — copy it now, it won&apos;t be shown again
            </p>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setNewKey(null)}
              aria-label="Dismiss new key"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={newKey}
              className="font-mono text-sm bg-background"
            />
            <Button
              variant="outline"
              size="default"
              onClick={() => handleCopy(newKey)}
            >
              <Copy data-icon="inline-start" className="size-4" />
              Copy
            </Button>
          </div>
        </div>
      )}

      {/* Key list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morphis-primary" />
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <Key className="mx-auto size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No API keys yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generate your first key to get started with the Morphis SDK
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
            <span>Key</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-border">
            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3"
              >
                <span className="font-mono text-sm text-foreground truncate">
                  {maskKey(apiKey.key_hash)}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(apiKey.created_at)}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleCopy(maskKey(apiKey.key_hash))}
                    aria-label="Copy key"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteClick(apiKey.id)}
                    aria-label="Delete key"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {keys.length} of {MAX_KEYS} keys used
      </p>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="size-5 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any applications using this key will
              lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Key'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
