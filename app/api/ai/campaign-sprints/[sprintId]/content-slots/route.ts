import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { CampaignStructure, ContentSlotSchema, ExecutionPlan } from '@/lib/ai/schemas'
import { CONTENT_SLOT_PLANNER_SYSTEM_PROMPT, CONTENT_SLOT_PLANNER_USER_PROMPT, ContentSlotPlannerContext } from '@/lib/ai/prompts/content-slot-planner'
import { enforceConstraints } from '@/lib/ai/execution-planner'
import { z } from 'zod'

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
      .from('sprint_plans')
      .select('*')
      .eq('id', sprintId)
      .single()

    if (sprintError || !sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
    }

    // 2. Fetch campaign structure
    const { data: campaign, error: campaignError } = await db
      .from('campaigns')
      .select('*, goals(*), segments(*), topics(*), narratives(*)')
      .eq('id', sprint.campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // 3. Fetch sprint's related data (junction tables)
    // Fetch focus segments
    const { data: focusSegmentsData } = await db
      .from('sprint_focus_segments')
      .select('segment_id')
      .eq('sprint_id', sprintId)
    
    const focusSegmentIds = (focusSegmentsData || []).map((d: any) => d.segment_id)
    const focusSegments = (campaign.segments || [])
      .filter((s: any) => focusSegmentIds.includes(s.id))
      .map((s: any) => ({ id: s.id, name: s.name }))

    // Fetch focus topics
    const { data: focusTopicsData } = await db
      .from('sprint_focus_topics')
      .select('topic_id')
      .eq('sprint_id', sprintId)

    const focusTopicIds = (focusTopicsData || []).map((d: any) => d.topic_id)
    const focusTopics = (campaign.topics || [])
      .filter((t: any) => focusTopicIds.includes(t.id))
      .map((t: any) => ({ id: t.id, name: t.name }))

    // Fetch focus channels
    const { data: focusChannelsData } = await db
      .from('sprint_focus_channels')
      .select('channel')
      .eq('sprint_id', sprintId)
    
    const focusChannels = (focusChannelsData || []).map((d: any) => d.channel)

    // Prepare context
    const plannerContext: ContentSlotPlannerContext = {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        focus_stage: sprint.focus_stage,
        key_messages_summary: sprint.key_messages_summary,
        suggested_weekly_post_volume: sprint.suggested_weekly_post_volume,
      },
      campaign: {
        id: campaign.id,
        name: campaign.name,
        campaign_type: campaign.campaign_type,
        primary_goal_type: campaign.primary_goal_type,
      },
      structure: {
        goals: campaign.goals || [],
        segments: campaign.segments || [],
        topics: campaign.topics || [],
        narratives: campaign.narratives || [],
      },
      focus_segments: focusSegments,
      focus_topics: focusTopics,
      focus_channels: focusChannels,
      volume_override: weekly_post_volume,
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          sendSSE(controller, 'progress', { message: 'Sprint kontextus betöltése...' })
          sendSSE(controller, 'progress', { message: 'Fókusz területek elemzése...' })
          sendSSE(controller, 'progress', { message: `Tartalom slotok generálása a(z) "${sprint.name}" sprinthez...` })

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

          // Parse JSON
          let jsonContent = aiResponse.content.trim()
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
          } catch (e) {
            console.error('JSON parse error:', e)
            throw new Error('Failed to parse AI response')
          }

          if (!parsedResponse.content_slots || !Array.isArray(parsedResponse.content_slots)) {
            throw new Error('Invalid response format: missing content_slots array')
          }

          sendSSE(controller, 'progress', { message: 'Validálás és korlátok ellenőrzése...' })

          // Validate slots
          const validSlots = []
          const sprintStart = new Date(sprint.start_date)
          const sprintEnd = new Date(sprint.end_date)

          for (const slot of parsedResponse.content_slots) {
            try {
              // Basic schema validation
              const validatedSlot = ContentSlotSchema.parse(slot)
              
              // Date range validation
              const slotDate = new Date(validatedSlot.date)
              if (slotDate >= sprintStart && slotDate <= sprintEnd) {
                validSlots.push(validatedSlot)
              }
            } catch (validationError) {
              console.warn('Slot validation failed:', validationError)
            }
          }

          // Enforce constraints
          // We need to mock an ExecutionPlan structure for the helper function
          const mockPlan: ExecutionPlan = {
            sprints: [sprint], // Minimal sprint data needed
            content_calendar: validSlots,
          }

          const { plan: finalPlan, warnings } = enforceConstraints(mockPlan, focusChannels)

          if (warnings.length > 0) {
            console.warn('Constraint warnings:', warnings)
          }

          sendSSE(controller, 'progress', { message: 'Generálás kész!' })
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
