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
const serviceAdapter = new AnthropicAdapter({ anthropic })

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
      console.debug('Copilot runtime request', { length: inputMessages.length, properties })
    },
  },
})

const server = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter,
  endpoint: '/api/copilotkit',
  logLevel: 'info',
})

const rateLimiter = new TokenBucket({
  capacity: 20,
  refillIntervalMs: 10_000,
  tokensPerInterval: 3,
})

async function handleRequestWithThrottling(req: NextRequest) {
  if (!rateLimiter.tryRemoveTokens()) {
    throw new RateLimitError()
  }

  try {
    return await server.POST(req)
  } catch (error) {
    throw new Error(formatApiError(error))
  }
}

export const config = server.config

export async function POST(req: NextRequest) {
  try {
    return await handleRequestWithThrottling(req)
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 })
    }
    console.error('CopilotKit runtime failed', error)
    return NextResponse.json({ error: formatApiError(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST to interact with CopilotKit' }, { status: 405 })
}

