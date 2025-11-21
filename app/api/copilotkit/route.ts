import { NextRequest, NextResponse } from 'next/server'
import {
  AnthropicAdapter,
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { CampaignStructureSchema } from '@/lib/ai/schemas'
import { getAnthropicClient } from '@/lib/ai/client'
import { TokenBucket } from '@/lib/ai/rate-limit'
import { RateLimitError, formatApiError } from '@/lib/ai/errors'

const anthropic = getAnthropicClient()
const serviceAdapter = new AnthropicAdapter({
  anthropic,
  model: 'claude-haiku-4-5'
})

console.log('=== AnthropicAdapter initialized ===', { model: 'claude-haiku-4-5' })

function createCopilotActions(properties: Record<string, unknown>, url?: string) {
  return [
    {
      name: 'describeCampaignState',
      description: 'Sanitize campaign structure context for the agent',
      parameters: {
        type: 'object',
        properties: {
          includeDetails: { type: 'boolean' },
        },
      },
      handler: async ({ inputs }: { inputs?: Record<string, unknown> }) => {
        const narratives = [
          `Endpoint: ${url ?? 'copilotkit server'}`,
          properties.campaign_type
            ? `Campaign type: ${String(properties.campaign_type)}`
            : 'Campaign type unknown',
          inputs?.includeDetails ? 'Detailed view enabled' : 'Summary only',
        ].filter(Boolean)

        const safeStructure = {
          goals: [],
          segments: [],
          topics: [],
          narratives,
        }

        CampaignStructureSchema.parse(safeStructure)

        return {
          summary: `Captured campaign structure with ${narratives.length} notes`,
          details: safeStructure,
        }
      },
    },
    {
      name: 'logToolStatus',
      description: 'Used by agent to surface internal context metadata',
      parameters: {
        type: 'object',
        properties: {
          note: { type: 'string' },
        },
      },
      handler: async ({ inputs }: { inputs?: Record<string, unknown> }) => {
        return {
          status: 'logged',
          note: inputs?.note ?? 'No note supplied',
        }
      },
    },
  ]
}

const runtime = new CopilotRuntime({
  serviceAdapter,
  actions: ({ properties, url }) => createCopilotActions(properties, url),
  middleware: {
    onBeforeRequest: async ({ inputMessages, properties }) => {
      console.log('=== CopilotRuntime onBeforeRequest ===')
      console.log('Messages:', JSON.stringify(inputMessages, null, 2))
      console.log('Properties:', JSON.stringify(properties, null, 2))
    },
  },
})

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

