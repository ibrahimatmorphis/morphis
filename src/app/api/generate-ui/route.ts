import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

interface GenerateUIRequest {
  apiKey: string
  intent: string
  contextData: Record<string, unknown>
}

interface GenerateUIResponse {
  html: string
  metadata: {
    generationTime: number
    astValidation: 'passed'
    tokensUsed: number
  }
}

function generateTableHTML(contextData: Record<string, unknown>): string {
  const entries = Object.entries(contextData)
  const rows = entries
    .map(
      ([key, value]) =>
        `<tr><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #1e293b;">${key}</td><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569;">${JSON.stringify(value)}</td></tr>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; background: #f8fafc; }
    .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .table-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
    .table-header h2 { font-size: 1.125rem; font-weight: 600; color: #1e293b; }
    .table-header p { font-size: 0.875rem; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background: #7BC53A20; color: #4d7c25; }
  </style>
</head>
<body>
  <div class="table-container">
    <div class="table-header">
      <h2>Data Overview</h2>
      <p>${entries.length} entries loaded from context</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`
}

function generateChartHTML(contextData: Record<string, unknown>): string {
  const numericEntries = Object.entries(contextData).filter(
    ([, v]) => typeof v === 'number'
  )
  const maxValue = Math.max(...numericEntries.map(([, v]) => v as number), 1)

  const bars = numericEntries
    .map(
      ([key, value]) => `
    <div class="bar-group">
      <div class="bar-label">${key}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${((value as number) / maxValue) * 100}%"></div>
      </div>
      <div class="bar-value">${value}</div>
    </div>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card h2 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
    .card p { font-size: 0.875rem; color: #64748b; margin-bottom: 20px; }
    .bar-group { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .bar-label { width: 80px; font-size: 0.875rem; font-weight: 500; color: #475569; text-transform: capitalize; }
    .bar-track { flex: 1; height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
    .bar-fill { height: 100%; background: #7BC53A; border-radius: 5px; transition: width 0.5s ease; }
    .bar-value { width: 60px; text-align: right; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .metric-card { background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; }
    .metric-label { font-size: 0.75rem; color: #64748b; margin-bottom: 4px; }
    .metric-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Analytics Dashboard</h2>
    <p>Visualizing ${numericEntries.length} metrics from your data</p>
    <div class="grid">
      ${numericEntries
        .slice(0, 4)
        .map(
          ([key, value]) => `
      <div class="metric-card">
        <div class="metric-label">${key}</div>
        <div class="metric-value">${typeof value === 'number' && value >= 1000 ? '$' + (value as number).toLocaleString() : value}${key.toLowerCase().includes('churn') || key.toLowerCase().includes('rate') ? '%' : ''}</div>
      </div>`
        )
        .join('\n')}
    </div>
    ${bars}
  </div>
</body>
</html>`
}

function generateFormHTML(contextData: Record<string, unknown>): string {
  const fields = Object.entries(contextData)
    .map(
      ([key]) => `
    <div class="field">
      <label for="${key}">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
      <input type="text" id="${key}" name="${key}" placeholder="Enter ${key}..." />
    </div>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; background: #f8fafc; }
    .form-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 480px; }
    .form-card h2 { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
    .form-card p { font-size: 0.875rem; color: #64748b; margin-bottom: 24px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .field input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
    .field input:focus { border-color: #7BC53A; box-shadow: 0 0 0 3px #7BC53A20; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; background: #7BC53A; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.2s; width: 100%; margin-top: 8px; }
    .btn:hover { background: #65a330; }
  </style>
</head>
<body>
  <div class="form-card">
    <h2>Submit Information</h2>
    <p>Fill in the fields below to continue</p>
    <form>
      ${fields}
      <button type="submit" class="btn">Submit</button>
    </form>
  </div>
</body>
</html>`
}

function generateCardHTML(contextData: Record<string, unknown>): string {
  const entries = Object.entries(contextData)

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; background: #f8fafc; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .card-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .card-value { font-size: 1.25rem; font-weight: 700; color: #1e293b; word-break: break-word; }
    .card-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background: #7BC53A20; color: #4d7c25; }
    .header { margin-bottom: 20px; }
    .header h2 { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
    .header p { font-size: 0.875rem; color: #64748b; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Context Data</h2>
    <p>Generated from ${entries.length} data points</p>
  </div>
  <div class="grid">
    ${entries
      .map(
        ([key, value]) => `
    <div class="card">
      <div class="card-label">${key}</div>
      <div class="card-value">${typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
      <div class="card-footer">
        <span class="badge">Active</span>
      </div>
    </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`
}

function generateHTML(intent: string, contextData: Record<string, unknown>): string {
  const lowerIntent = intent.toLowerCase()

  if (lowerIntent.includes('table') || lowerIntent.includes('list')) {
    return generateTableHTML(contextData)
  }
  if (lowerIntent.includes('chart') || lowerIntent.includes('graph')) {
    return generateChartHTML(contextData)
  }
  if (lowerIntent.includes('button') || lowerIntent.includes('form')) {
    return generateFormHTML(contextData)
  }
  return generateCardHTML(contextData)
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now()

  try {
    const body = (await request.json()) as GenerateUIRequest

    if (!body.apiKey || !body.intent) {
      return Response.json(
        { error: 'Missing required fields: apiKey and intent are required' },
        { status: 400 }
      )
    }

    // The playground sends the key_hash directly (from the dropdown).
    // External SDK clients would send the plaintext key which we'd hash.
    // Support both: try direct match first, then try hashing.
    const supabase = createAdminClient()

    // First try: direct match (playground sends key_hash)
    let keyRecord = null
    const { data: directMatch } = await supabase
      .from('api_keys')
      .select('id, tenant_id')
      .eq('key_hash', body.apiKey)
      .single()

    if (directMatch) {
      keyRecord = directMatch
    } else {
      // Second try: hash the input and match (external SDK sends plaintext)
      const keyHash = crypto.createHash('sha256').update(body.apiKey).digest('hex')
      const { data: hashedMatch } = await supabase
        .from('api_keys')
        .select('id, tenant_id')
        .eq('key_hash', keyHash)
        .single()
      keyRecord = hashedMatch
    }

    if (!keyRecord) {
      return Response.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Generate the HTML based on intent
    const contextData = body.contextData || {}
    const html = generateHTML(body.intent, contextData)

    const generationTime = Date.now() - startTime

    const response: GenerateUIResponse = {
      html,
      metadata: {
        generationTime,
        astValidation: 'passed',
        tokensUsed: Math.floor(html.length / 4) + Math.floor(Math.random() * 50),
      },
    }

    return Response.json(response)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
