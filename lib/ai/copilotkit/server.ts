import { CopilotRuntime, AnthropicAdapter } from '@copilotkit/runtime'
import { getAnthropicClient } from '@/lib/ai/client'
import { CampaignStructureSchema } from '@/lib/ai/schemas'

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

