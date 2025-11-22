import { CopilotRuntime, AnthropicAdapter } from '@copilotkit/runtime'
import { Action, Parameter } from '@copilotkit/shared'
import { getAnthropicClient } from '@/lib/ai/client'
import { CampaignStructureSchema, BriefNormalizerOutputSchema, MessageGenerationRequestSchema, GeneratedMessageSchema, validateGeneratedMessage } from '@/lib/ai/schemas'
import { BRIEF_NORMALIZER_SYSTEM_PROMPT, BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_SYSTEM_PROMPT, STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'
import { MESSAGE_GENERATOR_SYSTEM_PROMPT, MESSAGE_GENERATOR_USER_PROMPT, MessageGenerationContext } from '@/lib/ai/prompts/message-generator'
import { createClient } from '@/lib/supabase/server'

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
function createCopilotActions(
  properties: Record<string, unknown>, 
  url?: string
): Action<Parameter[]>[] {
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
      handler: async (args: any) => {
        const { brief, campaignType, goalType } = args as { brief: string; campaignType?: string; goalType?: string }
        if (!brief) {
          throw new Error('Brief is required')
        }

        console.log('[generateCampaignStructure] Starting with brief:', brief.substring(0, 100) + '...')
        console.log('[generateCampaignStructure] Campaign type:', campaignType, 'Goal type:', goalType)

        const client = getAnthropicClient()
        const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'
        
        console.log('[generateCampaignStructure] Using model:', model)

        // Step 1: Brief Normalizer
        console.log('[generateCampaignStructure] Step 1: Calling Brief Normalizer')
        let normalizerResponse
        try {
          normalizerResponse = await client.messages.create({
            model,
            max_tokens: 1024,
            system: BRIEF_NORMALIZER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: BRIEF_NORMALIZER_USER_PROMPT(brief, campaignType, goalType) }
            ]
          })
          console.log('[generateCampaignStructure] Brief Normalizer response received')
        } catch (error) {
          console.error('[generateCampaignStructure] Brief Normalizer error:', error)
          throw new Error(`Brief Normalizer failed: ${error instanceof Error ? error.message : String(error)}`)
        }

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
        console.log('[generateCampaignStructure] Step 2: Calling Strategy Designer with normalized brief:', JSON.stringify(normalizedBrief, null, 2))
        let strategyResponse
        try {
          strategyResponse = await client.messages.create({
            model,
            max_tokens: 4096,
            system: STRATEGY_DESIGNER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: STRATEGY_DESIGNER_USER_PROMPT(normalizedBrief) }
            ]
          })
          console.log('[generateCampaignStructure] Strategy Designer response received')
        } catch (error) {
          console.error('[generateCampaignStructure] Strategy Designer error:', error)
          throw new Error(`Strategy Designer failed: ${error instanceof Error ? error.message : String(error)}`)
        }

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
          console.log('[generateCampaignStructure] Successfully validated campaign structure')
        } catch (validationError) {
          console.error('Strategy Designer Schema Validation Error:', validationError)
          console.error('Raw campaign structure:', JSON.stringify(campaignStructure, null, 2))
          throw new Error(`Failed to validate strategy designer output: ${validationError instanceof Error ? validationError.message : String(validationError)}`)
        }

        console.log('[generateCampaignStructure] Returning campaign structure with', 
          campaignStructure.goals?.length || 0, 'goals,',
          campaignStructure.segments?.length || 0, 'segments,',
          campaignStructure.topics?.length || 0, 'topics,',
          campaignStructure.narratives?.length || 0, 'narratives')
        return campaignStructure
      },
    },
    {
      name: 'generateMessageMatrix',
      description: 'Generate AI-powered messages for segment × topic combinations. Streams progress updates in real-time showing which combinations are being processed.',
      parameters: [
        {
          name: 'campaign_id',
          type: 'string' as const,
          description: 'The campaign ID to generate messages for',
          required: true,
        },
        {
          name: 'segment_ids',
          type: 'string' as const,
          description: 'Comma-separated list of segment IDs to generate messages for',
          required: true,
        },
        {
          name: 'topic_ids',
          type: 'string' as const,
          description: 'Comma-separated list of topic IDs to generate messages for',
          required: true,
        },
        {
          name: 'regenerate_combinations',
          type: 'string' as const,
          description: 'Optional: comma-separated list of segment_id:topic_id combinations to regenerate (e.g., "seg1:top1,seg2:top2")',
          required: false,
        },
      ],
      handler: async (args: any) => {
        const { 
          campaign_id, 
          segment_ids, 
          topic_ids, 
          regenerate_combinations 
        } = args as { 
          campaign_id: string
          segment_ids: string
          topic_ids: string
          regenerate_combinations?: string
        }
        const segmentIdsArray = segment_ids.split(',').map(s => s.trim()).filter(Boolean)
        const topicIdsArray = topic_ids.split(',').map(t => t.trim()).filter(Boolean)
        
        if (!segmentIdsArray.length || !topicIdsArray.length) {
          throw new Error('At least one segment and topic required')
        }

        // Parse regenerate combinations if provided
        const regenerateSet = new Set<string>()
        if (regenerate_combinations) {
          regenerate_combinations.split(',').forEach(combo => {
            const trimmed = combo.trim()
            if (trimmed) regenerateSet.add(trimmed)
          })
        }

        // Fetch campaign context
        const supabase = await createClient()
        const db = supabase.schema('campaign_os')

        const { data: campaign, error: campaignError } = await db
          .from('campaigns')
          .select('campaign_type, primary_goal_type, narratives')
          .eq('id', campaign_id)
          .single()

        if (campaignError || !campaign) {
          throw new Error('Campaign not found')
        }

        const campaignData = campaign as any

        // Fetch segments and topics
        const { data: segments } = await db
          .from('segments')
          .select('*')
          .in('id', segmentIdsArray)
          .eq('campaign_id', campaign_id)

        const { data: topics } = await db
          .from('topics')
          .select('*')
          .in('id', topicIdsArray)
          .eq('campaign_id', campaign_id)

        if (!segments || !topics || segments.length === 0 || topics.length === 0) {
          throw new Error('Segments or topics not found')
        }

        const client = getAnthropicClient()
        const generatedMessages: Array<{
          segment_id: string
          topic_id: string
          headline: string
          body: string
          proof_point?: string
          cta?: string
          message_type: 'core' | 'supporting' | 'contrast'
          campaign_id: string
        }> = []

        // Parse narratives
        let narratives: Array<{ title: string; description: string }> = []
        try {
          const narrativesData = campaignData.narratives
          if (narrativesData && typeof narrativesData === 'object') {
            const parsed = Array.isArray(narrativesData) ? narrativesData : []
            narratives = parsed.filter((n: any) => n && typeof n === 'object' && n.title && n.description)
          }
        } catch (e) {
          console.warn('Failed to parse narratives:', e)
        }

        const totalCombinations = segments.length * topics.length
        let processedCount = 0
        const failedCombinations: Array<{ segment: string; topic: string; error: string }> = []
        const progressUpdates: string[] = []

        // Generate messages for each segment × topic combination
        for (const segment of segments) {
          for (const topic of topics) {
            const comboKey = `${segment.id}:${topic.id}`
            const shouldRegenerate = regenerateSet.size > 0 ? regenerateSet.has(comboKey) : true

            if (!shouldRegenerate && regenerateSet.size > 0) {
              continue // Skip if specific combinations requested and this isn't one
            }

            try {
              // Track progress
              processedCount++
              progressUpdates.push(`Processing ${processedCount}/${totalCombinations}: ${segment.name} × ${topic.name}...`)

              const context: MessageGenerationContext = {
                campaign_type: campaignData.campaign_type,
                goal_type: campaignData.primary_goal_type,
                narratives: narratives.length > 0 ? narratives : undefined,
                segment: {
                  id: segment.id,
                  name: segment.name,
                  description: segment.description || undefined,
                  demographics: segment.demographics as Record<string, unknown> | undefined,
                  psychographics: segment.psychographics as Record<string, unknown> | undefined,
                },
                topic: {
                  id: topic.id,
                  name: topic.name,
                  description: topic.description || undefined,
                  category: topic.category || undefined,
                },
              }

              const response = await client.messages.create({
                model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
                max_tokens: 1024,
                system: MESSAGE_GENERATOR_SYSTEM_PROMPT,
                messages: [
                  { role: 'user', content: MESSAGE_GENERATOR_USER_PROMPT(context) }
                ]
              })

              const content = response.content[0].type === 'text' 
                ? response.content[0].text 
                : ''

              if (!content) {
                console.warn(`Empty response for segment ${segment.name}, topic ${topic.name}`)
                failedCombinations.push({
                  segment: segment.name,
                  topic: topic.name,
                  error: 'Empty AI response'
                })
                continue
              }

              // Extract JSON from response
              let jsonContent = content.trim()
              if (jsonContent.startsWith('```')) {
                const lines = jsonContent.split('\n')
                const firstLine = lines[0]
                const lastLine = lines[lines.length - 1]
                if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
                  jsonContent = lines.slice(1, -1).join('\n')
                }
              }

              let messageData
              try {
                messageData = JSON.parse(jsonContent)
              } catch (parseError) {
                console.error(`JSON parse error for ${segment.name} × ${topic.name}:`, parseError)
                failedCombinations.push({
                  segment: segment.name,
                  topic: topic.name,
                  error: 'Invalid JSON response'
                })
                continue
              }

              // Validate and add campaign_id
              try {
                const validated = validateGeneratedMessage({
                  ...messageData,
                  campaign_id,
                })
                generatedMessages.push(validated)
              } catch (validationError) {
                console.error(`Validation error for ${segment.name} × ${topic.name}:`, validationError)
                failedCombinations.push({
                  segment: segment.name,
                  topic: topic.name,
                  error: 'Schema validation failed'
                })
                continue
              }
            } catch (error) {
              console.error(`Error generating message for ${segment.name} × ${topic.name}:`, error)
              failedCombinations.push({
                segment: segment.name,
                topic: topic.name,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
              continue
            }
          }
        }

        if (generatedMessages.length === 0) {
          throw new Error(`Failed to generate any messages. Attempted ${totalCombinations} combinations.${failedCombinations.length > 0 ? ` Errors: ${JSON.stringify(failedCombinations)}` : ''}`)
        }

        const successCount = generatedMessages.length
        const failureCount = failedCombinations.length

        return {
          messages: generatedMessages,
          total_combinations: totalCombinations,
          generated_count: successCount,
          failed_count: failureCount,
          failed_combinations: failedCombinations,
          progress_summary: `✅ Generation complete: ${successCount} messages generated${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        }
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
      handler: async (args: any) => {
        const { includeDetails } = args as { includeDetails?: boolean }
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
      handler: async (args: any) => {
        const { note } = args as { note?: string }
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

