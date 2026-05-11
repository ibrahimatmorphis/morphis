'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Play, ChevronDown, Terminal, Loader2 } from 'lucide-react'
import { listApiKeys } from '@/actions/api-keys'
import type { ApiKey } from '@/types'

interface ConsoleEntry {
  timestamp: string
  type: 'info' | 'success' | 'error'
  message: string
}

interface GenerateUIResponse {
  html: string
  metadata: {
    generationTime: number
    astValidation: 'passed'
    tokensUsed: number
  }
}

function maskKey(keyHash: string): string {
  if (keyHash.length <= 12) return keyHash
  return `${keyHash.slice(0, 8)}...${keyHash.slice(-4)}`
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const DEFAULT_CONTEXT = JSON.stringify(
  {
    users: 12,
    mrr: 5000,
    churn: 2.4,
    plan: 'Pro',
  },
  null,
  2
)

export default function PlaygroundPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedKeyHash, setSelectedKeyHash] = useState<string>('')
  const [intent, setIntent] = useState('')
  const [contextData, setContextData] = useState(DEFAULT_CONTEXT)
  const [loading, setLoading] = useState(false)
  const [keysLoading, setKeysLoading] = useState(true)
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null)
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([])
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  const consoleRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const addConsoleEntry = useCallback(
    (type: ConsoleEntry['type'], message: string) => {
      setConsoleEntries((prev) => [
        ...prev,
        { timestamp: getTimestamp(), type, message },
      ])
    },
    []
  )

  // Fetch API keys on mount
  useEffect(() => {
    async function fetchKeys() {
      setKeysLoading(true)
      const result = await listApiKeys()
      if ('keys' in result) {
        setApiKeys(result.keys)
        if (result.keys.length > 0) {
          setSelectedKeyHash(result.keys[0].key_hash)
        }
      }
      setKeysLoading(false)
    }
    fetchKeys()
  }, [])

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleEntries])

  const handleRun = async () => {
    if (!selectedKeyHash) {
      addConsoleEntry('error', 'No API key selected')
      return
    }
    if (!intent.trim()) {
      addConsoleEntry('error', 'Intent/prompt is required')
      return
    }

    // Validate JSON
    let parsedContext: Record<string, unknown> = {}
    try {
      parsedContext = JSON.parse(contextData || '{}')
    } catch {
      addConsoleEntry('error', 'Invalid JSON in context data')
      return
    }

    setLoading(true)
    setGeneratedHTML(null)
    setElapsedMs(0)
    startTimeRef.current = Date.now()

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current)
    }, 10)

    const payloadSize = JSON.stringify({
      apiKey: selectedKeyHash,
      intent,
      contextData: parsedContext,
    }).length

    addConsoleEntry(
      'info',
      `POST /api/generate-ui — payload: ${payloadSize} bytes`
    )

    try {
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: selectedKeyHash,
          intent,
          contextData: parsedContext,
        }),
      })

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      const finalElapsed = Date.now() - startTimeRef.current
      setElapsedMs(finalElapsed)

      if (!response.ok) {
        const errorData = await response.json()
        addConsoleEntry('error', `Error ${response.status}: ${errorData.error}`)
        setLoading(false)
        return
      }

      const data: GenerateUIResponse = await response.json()

      addConsoleEntry(
        'success',
        `Response received — ${data.metadata.generationTime}ms generation time`
      )
      addConsoleEntry(
        'success',
        `AST Validation: Passed ✓`
      )
      addConsoleEntry(
        'info',
        `Tokens used: ${data.metadata.tokensUsed} — Latency: ${finalElapsed}ms`
      )

      setGeneratedHTML(data.html)
    } catch (error) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      addConsoleEntry(
        'error',
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Playground</h1>
          <p className="text-sm text-slate-500 mt-1">
            Test UI generation with your API keys in real-time
          </p>
        </div>
        {elapsedMs !== null && (
          <div className="text-sm font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {loading ? (
              <span className="text-[#7BC53A] font-medium">{elapsedMs}ms...</span>
            ) : (
              <span>{elapsedMs}ms</span>
            )}
          </div>
        )}
      </div>

      {/* Main split pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left Pane - Configuration */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
          {/* API Key Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Key
            </label>
            <div className="relative">
              {keysLoading ? (
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400 border border-slate-200 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading keys...
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-slate-400 border border-slate-200 rounded-lg bg-slate-50">
                  No API keys found. Generate one in API Keys page.
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedKeyHash}
                    onChange={(e) => setSelectedKeyHash(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-10 text-sm font-mono text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7BC53A]/30 focus:border-[#7BC53A]"
                  >
                    {apiKeys.map((key) => (
                      <option key={key.id} value={key.key_hash}>
                        {maskKey(key.key_hash)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Intent Input */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Intent / Prompt
            </label>
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder='e.g. "Build a user management table" or "Show a revenue chart"'
              rows={3}
              className="w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7BC53A]/30 focus:border-[#7BC53A] placeholder:text-slate-400"
            />
          </div>

          {/* Context Data JSON Editor */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1 min-h-0 flex flex-col">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Context Data (JSON)
            </label>
            <textarea
              value={contextData}
              onChange={(e) => setContextData(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full px-4 py-3 text-sm font-mono text-green-300 bg-slate-900 border border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7BC53A]/30 focus:border-[#7BC53A] min-h-[120px]"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={loading || keysLoading || apiKeys.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#7BC53A] hover:bg-[#65a330] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run / Generate
              </>
            )}
          </button>
        </div>

        {/* Right Pane - Live Preview */}
        <div className="flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-500 font-mono ml-2">
              preview://localhost
            </span>
          </div>
          <div className="flex-1 min-h-0 bg-slate-50">
            {generatedHTML ? (
              <iframe
                srcDoc={generatedHTML}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
                title="Generated UI Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Click &quot;Run / Generate&quot; to preview the output
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Console */}
      <div className="h-40 min-h-[160px] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700 bg-slate-800">
          <Terminal className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-400">Console</span>
          {consoleEntries.length > 0 && (
            <button
              onClick={() => setConsoleEntries([])}
              className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div
          ref={consoleRef}
          className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs space-y-1"
        >
          {consoleEntries.length === 0 ? (
            <p className="text-slate-600 italic">
              Waiting for requests...
            </p>
          ) : (
            consoleEntries.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-600 shrink-0">
                  [{entry.timestamp}]
                </span>
                <span
                  className={
                    entry.type === 'error'
                      ? 'text-red-400'
                      : entry.type === 'success'
                        ? 'text-[#7BC53A]'
                        : 'text-slate-300'
                  }
                >
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
