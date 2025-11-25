import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { CampaignStructure, ContentSlotSchema, ExecutionPlan } from '@/lib/ai/schemas'
import { CONTENT_SLOT_PLANNER_SYSTEM_PROMPT, CONTENT_SLOT_PLANNER_USER_PROMPT, ContentSlotPlannerContext } from '@/lib/ai/prompts/content-slot-planner'
import { enforceConstraints } from '@/lib/ai/execution-planner'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { jsonrepair } from 'jsonrepair'

export const maxDuration = 120 // 2 minutes

/**
 * SSE helper to send progress events
 */
function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const encoder = new TextEncoder()
  const event = `data: ${JSON.stringify({ type, ...data })}\n\n`
  controller.enqueue(encoder.encode(event))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const { sprintId } = await params
    const body = await req.json().catch(() => ({}))
    const { weekly_post_volume } = body

    if (!sprintId) {
      return NextResponse.json({ error: 'sprintId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // 1. Fetch sprint with enhanced metadata
    const { data: sprint, error: sprintError } = await db
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .single()

    if (sprintError || !sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
    }

    // 2. Fetch campaign structure
    const { data: campaign, error: campaignError } = await db
      .from('campaigns')
      .select('*, goals(*), segments(*), topics(*), narrative_list:narratives(*)')
      .eq('id', sprint.campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // 3. Fetch sprint's related data (junction tables)
    // Fetch focus segments
    const { data: focusSegmentsData } = await db
      .from('sprint_segments')
      .select('segment_id')
      .eq('sprint_id', sprintId)
    
    const focusSegmentIds = (focusSegmentsData || []).map((d: any) => d.segment_id)
    const focusSegments = (campaign.segments || [])
      .filter((s: any) => focusSegmentIds.includes(s.id))
      .map((s: any) => ({ id: s.id, name: s.name }))

    // Fetch focus topics
    const { data: focusTopicsData } = await db
      .from('sprint_topics')
      .select('topic_id')
      .eq('sprint_id', sprintId)

    const focusTopicIds = (focusTopicsData || []).map((d: any) => d.topic_id)
    const focusTopics = (campaign.topics || [])
      .filter((t: any) => focusTopicIds.includes(t.id))
      .map((t: any) => ({ id: t.id, name: t.name }))

    // Fetch focus channels
    const { data: focusChannelsData } = await db
      .from('sprint_channels')
      .select('channel_key')
      .eq('sprint_id', sprintId)
    
    const focusChannels = (focusChannelsData || []).map((d: any) => d.channel_key)

    // 4. Query message strategies for campaign
    const { data: messageStrategies } = await db
      .from('message_strategies')
      .select('*')
      .eq('campaign_id', campaign.id)

    // Build strategy map: "segment_id:topic_id" -> strategy
    const strategiesMap: { [key: string]: any } = {}
    if (messageStrategies && messageStrategies.length > 0) {
      for (const strategy of messageStrategies) {
        const key = `${strategy.segment_id}:${strategy.topic_id}`
        strategiesMap[key] = {
          strategy_core: strategy.strategy_core,
          style_tone: strategy.style_tone,
          cta_funnel: strategy.cta_funnel,
          extra_fields: strategy.extra_fields
        }
      }
    }

    // Prepare context
    const plannerContext: ContentSlotPlannerContext = {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        focus_stage: sprint.focus_stage || undefined,
        key_messages_summary: sprint.key_messages_summary || undefined,
        suggested_weekly_post_volume: sprint.suggested_weekly_post_volume as any,
      },
      campaign: {
        id: campaign.id,
        name: campaign.name,
        campaign_type: campaign.campaign_type,
        primary_goal_type: campaign.primary_goal_type,
      },
      structure: {
        goals: (campaign.goals || []) as any,
        segments: (campaign.segments || []) as any,
        topics: (campaign.topics || []) as any,
        narratives: ((campaign as any).narrative_list || []) as any,
      },
      focus_segments: focusSegments,
      focus_topics: focusTopics,
      focus_channels: focusChannels,
      volume_override: weekly_post_volume,
      message_strategies_map: strategiesMap,
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          sendSSE(controller, 'progress', { message: 'Sprint kontextus betöltése...' })
          sendSSE(controller, 'progress', { message: 'Fókusz területek elemzése...' })
          sendSSE(controller, 'progress', { message: 'Message strategy-k betöltése...' })
          sendSSE(controller, 'progress', { message: `Tartalom slotok tervezése a(z) "${sprint.name}" sprinthez...` })
          sendSSE(controller, 'progress', { message: 'Slot metadata generálása (angle_type, cta_type, funnel_stage)...' })

          const provider = getAIProvider()
          const model = process.env.AI_MODEL || 'gpt-4o'
          const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1')
          const maxTokens = isReasoningModel ? 32768 : 4096

          const aiResponse = await provider.generateText({
            model,
            maxTokens,
            systemPrompt: CONTENT_SLOT_PLANNER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: CONTENT_SLOT_PLANNER_USER_PROMPT(plannerContext) }
            ],
          })

          if (!aiResponse.content) {
            throw new Error('Empty response from AI')
          }

          // Parse JSON - handle markdown code blocks and repair if needed
          let jsonContent = aiResponse.content.trim()
          
          // Remove markdown code blocks if present
          if (jsonContent.includes('```')) {
            const lines = jsonContent.split('\n')
            const firstLine = lines[0]
            const lastLine = lines[lines.length - 1]
            if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
              jsonContent = lines.slice(1, -1).join('\n')
            }
          }

          let parsedResponse: any
          try {
            parsedResponse = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error('Initial JSON parse error:', parseError)
            console.error('JSON content (first 500 chars):', jsonContent.substring(0, 500))
            
            // Try to repair the JSON using jsonrepair
            try {
              console.log('Attempting to repair JSON...')
              const repairedJson = jsonrepair(jsonContent)
              parsedResponse = JSON.parse(repairedJson)
              console.log('JSON successfully repaired')
            } catch (repairError) {
              console.error('JSON repair failed:', repairError)
              console.error('Full JSON content:', jsonContent)
              throw new Error('Failed to parse or repair AI response JSON')
            }
          }

          if (!parsedResponse.content_slots || !Array.isArray(parsedResponse.content_slots)) {
            throw new Error('Invalid response format: missing content_slots array')
          }

          sendSSE(controller, 'progress', { message: 'Validálás és korlátok ellenőrzése...' })

          // Validate slots and fix invalid values
          const validSlots = []
          const sprintStart = new Date(sprint.start_date)
          const sprintEnd = new Date(sprint.end_date)

          // UUID pattern matching Zod exactly
          const uuidPattern = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/
          
          // Valid objective values
          const validObjectives = ['reach', 'engagement', 'traffic', 'lead', 'conversion', 'mobilization']

          // Valid content types
          const validContentTypes = ['short_video', 'story', 'static_image', 'carousel', 'live', 'long_post', 'email']

          // Valid angle types
          const validAngleTypes = ['story', 'proof', 'how_to', 'comparison', 'behind_the_scenes', 'testimonial', 'other']

          // Valid CTA types
          const validCTATypes = ['soft_info', 'learn_more', 'signup', 'donate', 'attend_event', 'share', 'comment']

          // Valid funnel stages
          const validFunnelStages = ['awareness', 'engagement', 'consideration', 'conversion', 'mobilization']

          // Valid time of day values
          const validTimeOfDay = ['morning', 'midday', 'evening', 'unspecified']

          // Helper to normalize objective values
          const normalizeObjective = (obj: unknown): string | undefined => {
            if (typeof obj !== 'string') return undefined
            const normalized = obj.toLowerCase().trim()

            // Handle common variations
            if (normalized.includes('engagement')) {
              if (normalized.includes('mutual') || normalized.includes('community')) {
                return 'engagement' // Map "mutual engagement" to "engagement"
              }
              return 'engagement'
            }
            if (normalized.includes('reach') || normalized.includes('awareness')) return 'reach'
            if (normalized.includes('traffic') || normalized.includes('click')) return 'traffic'
            if (normalized.includes('lead') || normalized.includes('capture')) return 'lead'
            if (normalized.includes('conversion') || normalized.includes('purchase')) return 'conversion'
            if (normalized.includes('mobilization') || normalized.includes('action')) return 'mobilization'

            // Direct match
            if (validObjectives.includes(normalized)) return normalized
            return undefined
          }

          // Helper to normalize angle_type
          const normalizeAngleType = (val: unknown): string => {
            if (typeof val !== 'string') return 'other'
            const normalized = val.toLowerCase().trim().replace(/[-_]/g, '_')
            if (validAngleTypes.includes(normalized)) return normalized
            return 'other'
          }

          // Helper to normalize cta_type
          const normalizeCTAType = (val: unknown): string => {
            if (typeof val !== 'string') return 'learn_more'
            const normalized = val.toLowerCase().trim().replace(/[-_]/g, '_')
            if (validCTATypes.includes(normalized)) return normalized
            return 'learn_more'
          }

          // Helper to normalize funnel_stage
          const normalizeFunnelStage = (val: unknown, fallback: string = 'awareness'): string => {
            if (typeof val !== 'string') return fallback
            const normalized = val.toLowerCase().trim()
            if (validFunnelStages.includes(normalized)) return normalized
            return fallback
          }

          // Helper to normalize time_of_day
          const normalizeTimeOfDay = (val: unknown): string | undefined => {
            if (typeof val !== 'string') return undefined
            const normalized = val.toLowerCase().trim()
            if (validTimeOfDay.includes(normalized)) return normalized
            return undefined
          }

          for (const slot of parsedResponse.content_slots) {
            try {
              // Skip if slot is null or not an object
              if (!slot || typeof slot !== 'object') {
                console.warn('Skipping invalid slot: not an object', slot)
                continue
              }

              // Check for required fields before processing
              if (!slot.date || !slot.channel || !slot.objective || !slot.content_type || slot.slot_index === undefined) {
                console.warn('Skipping incomplete slot (missing required fields):', {
                  hasDate: !!slot.date,
                  hasChannel: !!slot.channel,
                  hasObjective: !!slot.objective,
                  hasContentType: !!slot.content_type,
                  hasSlotIndex: slot.slot_index !== undefined,
                  slot
                })
                continue
              }

              // Normalize objective
              const normalizedObjective = normalizeObjective(slot.objective)
              if (!normalizedObjective) {
                console.warn('Skipping slot with invalid objective:', slot.objective, 'slot:', slot)
                continue
              }

              // Normalize content_type
              let normalizedContentType = typeof slot.content_type === 'string' 
                ? slot.content_type.toLowerCase().trim() 
                : undefined
              
              if (!normalizedContentType || !validContentTypes.includes(normalizedContentType)) {
                console.warn('Skipping slot with invalid content_type:', slot.content_type, 'slot:', slot)
                continue
              }

              // Fix and validate UUIDs
              // Normalize null values to undefined for optional fields (Zod's optional() doesn't accept null)
              const normalizeOptionalString = (value: unknown): string | undefined => {
                if (value === null || value === undefined) return undefined
                if (typeof value === 'string' && value.trim().length > 0) return value.trim()
                return undefined
              }

              const slotWithFixedId = {
                id: (slot.id && typeof slot.id === 'string' && uuidPattern.test(slot.id))
                  ? slot.id
                  : randomUUID(),
                sprint_id: (slot.sprint_id && typeof slot.sprint_id === 'string' && uuidPattern.test(slot.sprint_id))
                  ? slot.sprint_id
                  : sprintId,
                campaign_id: campaign.id,
                date: slot.date,
                channel: slot.channel,
                slot_index: typeof slot.slot_index === 'number' ? slot.slot_index : parseInt(String(slot.slot_index || '1'), 10),
                primary_segment_id: (slot.primary_segment_id && typeof slot.primary_segment_id === 'string' && uuidPattern.test(slot.primary_segment_id))
                  ? slot.primary_segment_id
                  : undefined,
                primary_topic_id: (slot.primary_topic_id && typeof slot.primary_topic_id === 'string' && uuidPattern.test(slot.primary_topic_id))
                  ? slot.primary_topic_id
                  : undefined,
                // New required fields from Story 6.1
                funnel_stage: normalizeFunnelStage(slot.funnel_stage, sprint.focus_stage || 'awareness'),
                related_goal_ids: Array.isArray(slot.related_goal_ids) && slot.related_goal_ids.length > 0
                  ? slot.related_goal_ids.filter((id: any) => typeof id === 'string' && uuidPattern.test(id))
                  : (Array.isArray(sprint.focus_goals) && sprint.focus_goals.length > 0 ? sprint.focus_goals.slice(0, 2) : []),
                angle_type: normalizeAngleType(slot.angle_type),
                cta_type: normalizeCTAType(slot.cta_type),
                // Optional new fields
                secondary_segment_ids: Array.isArray(slot.secondary_segment_ids)
                  ? slot.secondary_segment_ids.filter((id: any) => typeof id === 'string' && uuidPattern.test(id)).slice(0, 2)
                  : undefined,
                secondary_topic_ids: Array.isArray(slot.secondary_topic_ids)
                  ? slot.secondary_topic_ids.filter((id: any) => typeof id === 'string' && uuidPattern.test(id)).slice(0, 2)
                  : undefined,
                time_of_day: normalizeTimeOfDay(slot.time_of_day),
                tone_override: normalizeOptionalString(slot.tone_override),
                objective: normalizedObjective,
                content_type: normalizedContentType,
                status: slot.status || 'planned',
                // Normalize null to undefined for optional string fields
                angle_hint: normalizeOptionalString(slot.angle_hint),
                notes: normalizeOptionalString(slot.notes),
              }
              
              // Basic schema validation
              const validatedSlot = ContentSlotSchema.parse(slotWithFixedId)
              
              // Date range validation
              const slotDate = new Date(validatedSlot.date)
              if (slotDate >= sprintStart && slotDate <= sprintEnd) {
                validSlots.push(validatedSlot)
              } else {
                console.warn('Skipping slot outside sprint date range:', {
                  slotDate: validatedSlot.date,
                  sprintStart: sprint.start_date,
                  sprintEnd: sprint.end_date
                })
              }
            } catch (validationError) {
              console.warn('Slot validation failed:', validationError)
              console.warn('Invalid slot data:', slot)
            }
          }

          // Log validation summary
          const totalSlots = parsedResponse.content_slots?.length || 0
          const validatedCount = validSlots.length
          const rejectedCount = totalSlots - validatedCount
          
          if (rejectedCount > 0) {
            console.warn(`Slot validation summary: ${validatedCount}/${totalSlots} slots validated successfully, ${rejectedCount} slots rejected`)
          } else {
            console.log(`Slot validation summary: ${validatedCount}/${totalSlots} slots validated successfully`)
          }

          if (validSlots.length === 0) {
            throw new Error('No valid content slots were generated. Please check the server logs for validation errors.')
          }

          // Enforce constraints
          // We need to mock an ExecutionPlan structure for the helper function
          const mockSprint = {
            ...sprint,
            focus_segments: focusSegmentIds,
            focus_topics: focusTopicIds,
            focus_channels: focusChannels,
          }

          const mockPlan: ExecutionPlan = {
            sprints: [mockSprint as any], // Minimal sprint data needed, cast to any to avoid DB vs Schema type mismatches
            content_calendar: validSlots,
          }

          const { plan: finalPlan, warnings } = enforceConstraints(mockPlan, focusChannels)

          if (warnings.length > 0) {
            console.warn('Constraint warnings:', warnings)
          }

          sendSSE(controller, 'progress', { message: 'Slot tervezés kész!' })
          sendSSE(controller, 'done', { content_slots: finalPlan.content_calendar })
          controller.close()

        } catch (error) {
          console.error('Content slot generation error:', error)
          sendSSE(controller, 'error', { message: error instanceof Error ? error.message : 'Unknown error' })
          controller.close()
        }
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
