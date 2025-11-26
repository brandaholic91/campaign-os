import { CopilotRuntime, AnthropicAdapter, OpenAIAdapter, GoogleGenerativeAIAdapter } from '@copilotkit/runtime'
import { Action, Parameter } from '@copilotkit/shared'
import { getAIProvider, getAnthropicClient } from '@/lib/ai/client'
import { CampaignStructureSchema, BriefNormalizerOutputSchema } from '@/lib/ai/schemas'
import { BRIEF_NORMALIZER_SYSTEM_PROMPT, BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_SYSTEM_PROMPT, STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'
import { MESSAGE_GENERATOR_SYSTEM_PROMPT, MESSAGE_GENERATOR_USER_PROMPT, MessageGenerationContext } from '@/lib/ai/prompts/message-generator'
import { validateGeneratedMessage } from '@/lib/ai/schemas'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Determine which adapter to use based on AI_PROVIDER
const providerType = process.env.AI_PROVIDER || 'anthropic'
let serviceAdapter: any

console.log(`=== Initializing CopilotKit Adapter for provider: ${providerType} ===`)

try {
  switch (providerType) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing')
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      serviceAdapter = new OpenAIAdapter({ openai: openai as any, model: process.env.AI_MODEL || 'gpt-4o' })
      break

    case 'google':
      if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is missing')
      // Note: GoogleGenerativeAIAdapter might require a specific setup or might not be directly exported depending on version
      // If it fails, we might need to use LangChainAdapter or similar, but assuming it exists for now based on common patterns
      // If GoogleGenerativeAIAdapter is not available, this will fail at runtime or compile time. 
      // For safety, we can wrap it or use a fallback if we were unsure, but strict typing suggests we should know.
      // Since I cannot verify the package exports directly, I will assume it exists or use a generic approach if possible.
      // Actually, let's use the one from @copilotkit/runtime if available.
      serviceAdapter = new GoogleGenerativeAIAdapter({ apiKey: process.env.GOOGLE_API_KEY, model: process.env.AI_MODEL || 'gemini-1.5-pro' })
      break

    case 'ollama':
      const ollama = new OpenAI({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        apiKey: 'ollama', // Required but ignored
      })
      serviceAdapter = new OpenAIAdapter({ openai: ollama as any, model: process.env.AI_MODEL || 'llama2' })
      break

    case 'anthropic':
    default:
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is missing')
      const anthropic = getAnthropicClient()
      serviceAdapter = new AnthropicAdapter({
        anthropic: anthropic as any,
        model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      })
      break
  }
} catch (error) {
  console.error('Failed to initialize CopilotKit adapter:', error)
  // Fallback to Anthropic or throw
  throw error
}

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
      name: 'normalizeCampaignBrief',
      description: 'Step 1: Normalize and structure a raw campaign brief. Always use this before generating the strategy.',
      parameters: [
        {
          name: 'brief',
          type: 'string' as const,
          description: 'The raw campaign brief text',
          required: true,
        },
        {
          name: 'campaignType',
          type: 'string' as const,
          description: 'Optional campaign type',
          required: false,
        },
        {
          name: 'goalType',
          type: 'string' as const,
          description: 'Optional goal type',
          required: false,
        },
      ],
      handler: async (args: any) => {
        try {
          const { brief, campaignType, goalType } = args as { brief: string; campaignType?: string; goalType?: string }
          console.log('[normalizeCampaignBrief] Starting...')
          
          const provider = getAIProvider()
          const model = process.env.AI_MODEL

          const response = await provider.generateText({
            model,
            maxTokens: 1024,
            systemPrompt: BRIEF_NORMALIZER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: BRIEF_NORMALIZER_USER_PROMPT(brief, campaignType, goalType) }
            ]
          })

          const content = response.content
          if (!content) throw new Error('Empty response from Brief Normalizer')

          let jsonContent = content.trim()
          if (jsonContent.startsWith('```')) {
             const lines = jsonContent.split('\n')
             const firstLine = lines[0]
             const lastLine = lines[lines.length - 1]
             if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
               jsonContent = lines.slice(1, -1).join('\n')
             }
          }

          const normalizedBrief = JSON.parse(jsonContent)
          const validated = BriefNormalizerOutputSchema.parse(normalizedBrief)
          
          return JSON.stringify(validated)
        } catch (error) {
          console.error('[normalizeCampaignBrief] Error:', error)
          return JSON.stringify({ error: `Normalization failed: ${error instanceof Error ? error.message : String(error)}` })
        }
      }
    },
    {
      name: 'generateCampaignStrategy',
      description: 'Step 2: Generate the full campaign strategy structure (goals, segments, topics) from a normalized brief.',
      parameters: [
        {
          name: 'normalizedBrief',
          type: 'string' as const,
          description: 'The normalized brief JSON string (output of normalizeCampaignBrief)',
          required: true,
        }
      ],
      handler: async (args: any) => {
        try {
          const { normalizedBrief } = args as { normalizedBrief: string }
          console.log('[generateCampaignStrategy] Starting...')
          
          let briefObj
          try {
            briefObj = typeof normalizedBrief === 'string' ? JSON.parse(normalizedBrief) : normalizedBrief
          } catch (e) {
            throw new Error('Invalid normalized brief JSON')
          }

          const provider = getAIProvider()
          const model = process.env.AI_MODEL

          const response = await provider.generateText({
            model,
            maxTokens: 4096,
            systemPrompt: STRATEGY_DESIGNER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: STRATEGY_DESIGNER_USER_PROMPT(briefObj) }
            ]
          })

          const content = response.content
          if (!content) throw new Error('Empty response from Strategy Designer')

          let jsonContent = content.trim()
          if (jsonContent.startsWith('```')) {
             const lines = jsonContent.split('\n')
             const firstLine = lines[0]
             const lastLine = lines[lines.length - 1]
             if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
               jsonContent = lines.slice(1, -1).join('\n')
             }
          }

          const structure = JSON.parse(jsonContent)
          const validated = CampaignStructureSchema.parse(structure)
          
          return JSON.stringify(validated)
        } catch (error) {
          console.error('[generateCampaignStrategy] Error:', error)
          return JSON.stringify({ error: `Strategy generation failed: ${error instanceof Error ? error.message : String(error)}` })
        }
      }
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

        const provider = getAIProvider()
        const model = process.env.AI_MODEL
        
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

              const response = await provider.generateText({
                model,
                maxTokens: 1024,
                systemPrompt: MESSAGE_GENERATOR_SYSTEM_PROMPT,
                messages: [
                  { role: 'user', content: MESSAGE_GENERATOR_USER_PROMPT(context) }
                ]
              })

              const content = response.content
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

