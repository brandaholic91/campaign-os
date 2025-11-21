import { CopilotRuntime, AnthropicAdapter } from '@copilotkit/runtime'
import { getAnthropicClient } from '@/lib/ai/client'
import { CampaignStructureSchema, BriefNormalizerOutputSchema } from '@/lib/ai/schemas'
import { BRIEF_NORMALIZER_SYSTEM_PROMPT, BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_SYSTEM_PROMPT, STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'

// Initialize Anthropic client
const anthropic = getAnthropicClient()

// Create AnthropicAdapter instance
// Note: AnthropicAdapter accepts the Anthropic client instance from @anthropic-ai/sdk
const serviceAdapter = new AnthropicAdapter({
  anthropic: anthropic as any,
  model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
})

console.log('=== AnthropicAdapter initialized ===', { model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5' })

/**
 * Creates CopilotKit actions for backend operations
 * Parameters use CopilotKit's Parameter[] format, not JSON Schema
 * @param properties - Context properties from CopilotKit
 * @param url - Request URL
 * @returns Array of action definitions
 */
function createCopilotActions(properties: Record<string, unknown>, url?: string) {
  return [
    {
      name: 'generateCampaignStructure',
      description: 'Generate campaign structure (goals, segments, topics, narratives) from a text brief using AI. This is a two-step process: first normalizes the brief, then designs the strategy.',
      parameters: [
        {
          name: 'brief',
          type: 'string' as const,
          description: 'The campaign brief text description',
          required: true,
        },
        {
          name: 'campaignType',
          type: 'string' as const,
          description: 'Optional campaign type (political_election, political_issue, brand_awareness, product_launch, promo, ngo_issue)',
          required: false,
        },
        {
          name: 'goalType',
          type: 'string' as const,
          description: 'Optional goal type (awareness, engagement, list_building, conversion, mobilization)',
          required: false,
        },
      ],
      handler: async ({ brief, campaignType, goalType }: { brief: string; campaignType?: string; goalType?: string }) => {
        if (!brief) {
          throw new Error('Brief is required')
        }

        const client = getAnthropicClient()
        const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'

        // Step 1: Brief Normalizer
        const normalizerResponse = await client.messages.create({
          model,
          max_tokens: 1024,
          system: BRIEF_NORMALIZER_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: BRIEF_NORMALIZER_USER_PROMPT(brief, campaignType, goalType) }
          ]
        })

        const normalizerContent = normalizerResponse.content[0].type === 'text' 
          ? normalizerResponse.content[0].text 
          : ''
        
        if (!normalizerContent) {
          throw new Error('Empty response from Brief Normalizer')
        }

        // Extract JSON from response (handle markdown code blocks)
        let normalizerJsonContent = normalizerContent.trim()
        
        if (normalizerJsonContent.startsWith('```')) {
          const lines = normalizerJsonContent.split('\n')
          const firstLine = lines[0]
          const lastLine = lines[lines.length - 1]
          
          if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
            normalizerJsonContent = lines.slice(1, -1).join('\n')
          }
        }

        let normalizedBrief
        try {
          normalizedBrief = JSON.parse(normalizerJsonContent)
        } catch (parseError) {
          console.error('Brief Normalizer JSON Parse Error:', parseError)
          throw new Error('Failed to parse brief normalizer response as JSON')
        }

        try {
          normalizedBrief = BriefNormalizerOutputSchema.parse(normalizedBrief)
        } catch (validationError) {
          console.error('Brief Normalizer Schema Validation Error:', validationError)
          throw new Error('Failed to validate brief normalizer output')
        }

        // Step 2: Strategy Designer
        const strategyResponse = await client.messages.create({
          model,
          max_tokens: 4096,
          system: STRATEGY_DESIGNER_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: STRATEGY_DESIGNER_USER_PROMPT(normalizedBrief) }
          ]
        })

        const strategyContent = strategyResponse.content[0].type === 'text'
          ? strategyResponse.content[0].text
          : ''

        if (!strategyContent) {
          throw new Error('Empty response from Strategy Designer')
        }

        // Extract JSON from response (handle markdown code blocks)
        let strategyJsonContent = strategyContent.trim()
        
        if (strategyJsonContent.startsWith('```')) {
          const lines = strategyJsonContent.split('\n')
          const firstLine = lines[0]
          const lastLine = lines[lines.length - 1]
          
          if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
            strategyJsonContent = lines.slice(1, -1).join('\n')
          }
        }

        let campaignStructure
        try {
          campaignStructure = JSON.parse(strategyJsonContent)
        } catch (parseError) {
          console.error('Strategy Designer JSON Parse Error:', parseError)
          throw new Error('Failed to parse strategy designer response as JSON')
        }

        try {
          campaignStructure = CampaignStructureSchema.parse(campaignStructure)
        } catch (validationError) {
          console.error('Strategy Designer Schema Validation Error:', validationError)
          throw new Error('Failed to validate strategy designer output')
        }

        return campaignStructure
      },
    },
    {
      name: 'describeCampaignState',
      description: 'Sanitize campaign structure context for the agent',
      parameters: [
        {
          name: 'includeDetails',
          type: 'boolean' as const,
          description: 'Whether to include detailed information in the response',
          required: false,
        },
      ],
      handler: async ({ includeDetails }: { includeDetails?: boolean }) => {
        const narratives = [
          `Endpoint: ${url ?? 'copilotkit server'}`,
          properties.campaign_type
            ? `Campaign type: ${String(properties.campaign_type)}`
            : 'Campaign type unknown',
          includeDetails ? 'Detailed view enabled' : 'Summary only',
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
      parameters: [
        {
          name: 'note',
          type: 'string' as const,
          description: 'The note to log',
          required: false,
        },
      ],
      handler: async ({ note }: { note?: string }) => {
        return {
          status: 'logged',
          note: note ?? 'No note supplied',
        }
      },
    },
  ]
}

// Create CopilotRuntime instance with singleton pattern
// This ensures the same runtime instance is reused across requests
let runtimeInstance: CopilotRuntime | null = null

/**
 * Get or create CopilotRuntime instance
 * Separating CopilotRuntime configuration enables reusability, testability, and future extensibility
 * @returns CopilotRuntime instance
 */
export function getCopilotRuntime(): CopilotRuntime {
  if (!runtimeInstance) {
    // CopilotRuntime constructor accepts: actions, middleware, remoteEndpoints, etc.
    // serviceAdapter is passed to copilotRuntimeNextJSAppRouterEndpoint, not to CopilotRuntime
    // Use type assertion to avoid complex generic type inference issues
    runtimeInstance = new CopilotRuntime({
      // Actions is an array generator function that takes properties and url
      // This allows customizing which backend actions are available based on frontend context
      actions: ({ properties, url }: { properties: Record<string, unknown>; url?: string }) => 
        createCopilotActions(properties, url),
      middleware: {
        onBeforeRequest: async ({ inputMessages, properties }: { 
          inputMessages: unknown[]; 
          properties: Record<string, unknown> 
        }) => {
          console.log('=== CopilotRuntime onBeforeRequest ===')
          console.log('Messages:', JSON.stringify(inputMessages, null, 2))
          console.log('Properties:', JSON.stringify(properties, null, 2))
        },
      },
    } as any)
  }
  return runtimeInstance
}

// Export serviceAdapter for use in endpoint
export { serviceAdapter }

