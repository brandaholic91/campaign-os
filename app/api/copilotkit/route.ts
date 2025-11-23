import { NextRequest, NextResponse } from 'next/server'
import { copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime'
import { getCopilotRuntime, serviceAdapter } from '@/lib/ai/copilotkit/server'
import { TokenBucket } from '@/lib/ai/rate-limit'
import { formatApiError } from '@/lib/ai/errors'

export const maxDuration = 60 // Increase timeout to 60 seconds for AI generation

// Get CopilotRuntime instance from server configuration
const runtime = getCopilotRuntime()

// Configure CopilotKit endpoint handler
// Endpoint focuses on HTTP handling, CopilotRuntime logic is in server.ts
const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter,
  endpoint: '/api/copilotkit',
})

const rateLimiter = new TokenBucket({
  capacity: 20,
  refillIntervalMs: 10_000,
  tokensPerInterval: 3,
})

export async function POST(req: NextRequest) {
  console.log('=== POST handler called ===')

  if (!rateLimiter.tryRemoveTokens()) {
    console.log('=== Rate limit exceeded ===')
    return NextResponse.json(
      { error: 'API rate limit exceeded. Please retry in a moment.' },
      { status: 429 }
    )
  }

  try {
    console.log('=== Calling handleRequest ===')
    const result = await handleRequest(req)
    console.log('=== handleRequest result ===', { status: result.status })
    return result
  } catch (error) {
    console.error('=== CopilotKit runtime error ===')
    console.error('Error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'no stack')
    return NextResponse.json(
      { error: formatApiError(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST to interact with CopilotKit' }, { status: 405 })
}

