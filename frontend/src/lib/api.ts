import FingerprintJS from '@fingerprintjs/fingerprintjs'

export interface PricingIssue {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  evidence: string
  recommendation: string
}

export interface TierAnalysis {
  name: string
  stated_price: string
  true_cost_estimate: string | null
  limitations: string[]
  hidden_requirements: string[]
}

export interface AnalysisResult {
  tool_name: string
  overall_score: number
  verdict: string
  issues: PricingIssue[]
  tiers: TierAnalysis[]
  summary: string
  recommendations: string[]
}

export interface TrialStatus {
  used: number
  remaining: number
  limit: number
}

let deviceId: string | null = null

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId
  
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  deviceId = result.visitorId
  return deviceId
}

export async function analyzePricing(
  content: string,
  toolName: string | null,
  language: string
): Promise<AnalysisResult> {
  const id = await getDeviceId()
  
  const response = await fetch('/api/v1/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': id,
    },
    body: JSON.stringify({
      content,
      tool_name: toolName,
      language,
    }),
  })
  
  if (!response.ok) {
    const data = await response.json()
    // Handle object detail properly
    const errorMessage = typeof data.detail === 'string' 
      ? data.detail 
      : data.detail?.error || data.detail?.message || 'Analysis failed'
    throw new Error(errorMessage)
  }
  
  return response.json()
}

export async function getTrialStatus(): Promise<TrialStatus> {
  const id = await getDeviceId()
  
  const response = await fetch('/api/v1/trial-status', {
    headers: {
      'X-Device-Id': id,
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to get trial status')
  }
  
  return response.json()
}
