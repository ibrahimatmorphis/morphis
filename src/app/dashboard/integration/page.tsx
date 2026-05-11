'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Code, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { listApiKeys } from '@/actions/api-keys'
import type { ApiKey } from '@/types'

function CodeBlock({ code, language = 'html' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-[#7BC53A]" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto">
        <code className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
      <span className="absolute bottom-3 right-3 text-xs text-slate-600 font-mono">{language}</span>
    </div>
  )
}

export default function IntegrationPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedKey, setSelectedKey] = useState<string>('YOUR_API_KEY')

  useEffect(() => {
    async function fetchKeys() {
      const result = await listApiKeys()
      if ('keys' in result && result.keys.length > 0) {
        setApiKeys(result.keys)
        setSelectedKey(result.keys[0].key_hash)
      }
    }
    fetchKeys()
  }, [])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-morphis-domain.com'

  const quickStartCode = `<!-- Add this to your HTML -->
<div id="morphis-widget"></div>

<script src="${baseUrl}/sdk/morphis.js"></script>
<script>
  Morphis.render({
    apiKey: '${selectedKey}',
    intent: 'show a revenue dashboard',
    contextData: {
      mrr: 5000,
      churn: 2.4,
      users: 120,
      plan: 'Pro'
    },
    target: '#morphis-widget',
    theme: 'light'
  });
</script>`

  const reactCode = `import { useEffect, useRef } from 'react';

export function MorphisWidget({ intent, data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load SDK
    const script = document.createElement('script');
    script.src = '${baseUrl}/sdk/morphis.js';
    script.onload = () => {
      window.Morphis.render({
        apiKey: '${selectedKey}',
        intent: intent,
        contextData: data,
        target: containerRef.current,
        onLoad: (result) => console.log('Rendered in', result.metadata.generationTime, 'ms'),
        onError: (err) => console.error('Morphis error:', err.message)
      });
    };
    document.head.appendChild(script);

    return () => window.Morphis?.destroy();
  }, [intent, data]);

  return <div ref={containerRef} style={{ minHeight: 200 }} />;
}`

  const apiDirectCode = `// Direct API call (without SDK)
const response = await fetch('${baseUrl}/api/generate-ui', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${selectedKey}',
    intent: 'build a user management table',
    contextData: {
      users: [
        { name: 'Alice', role: 'Admin', status: 'active' },
        { name: 'Bob', role: 'Member', status: 'active' }
      ]
    }
  })
});

const { html, metadata } = await response.json();
// html = generated HTML string
// metadata = { generationTime, astValidation, tokensUsed }

// Inject into sandboxed iframe
const iframe = document.createElement('iframe');
iframe.sandbox = 'allow-scripts';
iframe.srcdoc = html;
document.getElementById('container').appendChild(iframe);`

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integration Guide</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add AI-generated UI to your application in under 2 minutes.
        </p>
      </div>

      {/* API Key selector */}
      {apiKeys.length > 0 && (
        <div className="bg-[#7BC53A]/5 border border-[#7BC53A]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-[#7BC53A]" />
            <span className="text-sm font-medium text-slate-700">Using API Key:</span>
          </div>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BC53A]/30"
          >
            {apiKeys.map((key) => (
              <option key={key.id} value={key.key_hash}>
                {key.key_hash.slice(0, 16)}...{key.key_hash.slice(-8)}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-2">
            Code examples below use this key. Generate keys in the API Keys page.
          </p>
        </div>
      )}

      {/* Quick Start */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Quick Start (Vanilla JS)</h2>
        <p className="text-sm text-slate-500 mb-4">
          Drop these two lines into any HTML page. The SDK handles authentication, iframe sandboxing, and rendering.
        </p>
        <CodeBlock code={quickStartCode} language="html" />
      </section>

      {/* How it works */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-[#7BC53A]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-sm font-bold text-[#7BC53A]">1</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">SDK Authenticates</h3>
            <p className="text-xs text-slate-500">Your API key is validated server-side</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-[#7BC53A]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-sm font-bold text-[#7BC53A]">2</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">UI Generated</h3>
            <p className="text-xs text-slate-500">AI creates UI from your intent + data, validated via AST</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-[#7BC53A]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-sm font-bold text-[#7BC53A]">3</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Sandboxed Render</h3>
            <p className="text-xs text-slate-500">Injected into an isolated iframe — zero XSS risk</p>
          </div>
        </div>
      </section>

      {/* React Integration */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">React / Next.js</h2>
        <p className="text-sm text-slate-500 mb-4">
          Wrap the SDK in a React component for declarative usage.
        </p>
        <CodeBlock code={reactCode} language="tsx" />
      </section>

      {/* Direct API */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Direct API Call</h2>
        <p className="text-sm text-slate-500 mb-4">
          Call the generation endpoint directly if you want full control over rendering.
        </p>
        <CodeBlock code={apiDirectCode} language="javascript" />
      </section>

      {/* API Reference */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">API Reference</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#7BC53A]/10 text-[#65A330] text-xs font-bold rounded">POST</span>
              <code className="text-sm font-mono text-slate-700">/api/generate-ui</code>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-700 mb-2">Request Body:</p>
              <ul className="space-y-1 text-slate-600">
                <li><code className="text-xs bg-slate-200 px-1 rounded">apiKey</code> <span className="text-slate-400">string, required</span> — Your API key</li>
                <li><code className="text-xs bg-slate-200 px-1 rounded">intent</code> <span className="text-slate-400">string, required</span> — What UI to generate</li>
                <li><code className="text-xs bg-slate-200 px-1 rounded">contextData</code> <span className="text-slate-400">object, optional</span> — Data to populate the UI</li>
                <li><code className="text-xs bg-slate-200 px-1 rounded">theme</code> <span className="text-slate-400">string, optional</span> — &quot;light&quot; or &quot;dark&quot;</li>
              </ul>
              <p className="font-medium text-slate-700 mt-4 mb-2">Response:</p>
              <ul className="space-y-1 text-slate-600">
                <li><code className="text-xs bg-slate-200 px-1 rounded">html</code> — Generated HTML string (inject into iframe)</li>
                <li><code className="text-xs bg-slate-200 px-1 rounded">metadata.generationTime</code> — Time in ms</li>
                <li><code className="text-xs bg-slate-200 px-1 rounded">metadata.astValidation</code> — Always &quot;passed&quot;</li>
                <li><code className="text-xs bg-slate-200 px-1 rounded">metadata.tokensUsed</code> — Token count</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security note */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Security Model</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-[#7BC53A] mt-0.5">✓</span>
            All generated code runs inside a <code className="bg-slate-200 px-1 rounded text-xs">sandbox=&quot;allow-scripts&quot;</code> iframe — no access to parent DOM
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7BC53A] mt-0.5">✓</span>
            Communication between parent and iframe is exclusively via <code className="bg-slate-200 px-1 rounded text-xs">postMessage</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7BC53A] mt-0.5">✓</span>
            All generated HTML passes through AST validation before delivery
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7BC53A] mt-0.5">✓</span>
            We never connect to your database — you pass data via <code className="bg-slate-200 px-1 rounded text-xs">contextData</code>
          </li>
        </ul>
      </section>
    </div>
  )
}
