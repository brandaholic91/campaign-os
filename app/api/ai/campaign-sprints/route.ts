import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { isReadyForExecution } from '@/lib/validation/campaign-structure'
import { SprintPlanSchema, CampaignStructure } from '@/lib/ai/schemas'
import { SPRINT_PLANNER_SYSTEM_PROMPT, SPRINT_PLANNER_USER_PROMPT, SprintPlannerContext } from '@/lib/ai/prompts/sprint-planner'
import { randomUUID } from 'crypto'

export const maxDuration = 120 // 2 minutes for sprint generation

/**
 * SSE helper to send progress events
 */
function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const encoder = new TextEncoder()
  const event = `data: ${JSON.stringify({ type, ...data })}\n\n`
  controller.enqueue(encoder.encode(event))
}

/**
 * Calculate sprint count based on campaign duration
 */
function calculateSprintCount(campaignDurationDays: number): number {
  if (campaignDurationDays <= 10) return 1
  if (campaignDurationDays <= 25) return 2
  if (campaignDurationDays <= 45) return 3
  // For campaigns 46+ days, distribute evenly with 4-6 sprints
  if (campaignDurationDays <= 70) return 4
  if (campaignDurationDays <= 100) return 5
  return 6 // Max 6 sprints
}

/**
 * Calculate date ranges for sprints
 */
function calculateSprintDateRanges(
  startDate: string,
  endDate: string,
  sprintCount: number
): Array<{ start_date: string; end_date: string }> {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const daysPerSprint = Math.floor(totalDays / sprintCount)
  const extraDays = totalDays % sprintCount

  const ranges = []
  let currentStart = new Date(start)

  for (let i = 0; i < sprintCount; i++) {
    const sprintDays = daysPerSprint + (i < extraDays ? 1 : 0)
    const sprintEnd = new Date(currentStart)
    sprintEnd.setDate(currentStart.getDate() + sprintDays - 1)

    ranges.push({
      start_date: currentStart.toISOString().split('T')[0],
      end_date: sprintEnd.toISOString().split('T')[0],
    })

    currentStart = new Date(sprintEnd)
    currentStart.setDate(currentStart.getDate() + 1)
  }

  return ranges
}

/**
 * Get expected focus stage progression based on sprint number and total sprints
 */
function getExpectedFocusStage(sprintNumber: number, totalSprints: number): string {
  if (totalSprints === 1) {
    return 'engagement' // Single sprint focuses on core engagement
  }
  if (totalSprints === 2) {
    return sprintNumber === 1 ? 'awareness' : 'conversion'
  }
  if (totalSprints === 3) {
    if (sprintNumber === 1) return 'awareness'
    if (sprintNumber === 2) return 'engagement'
    return 'conversion'
  }
  // For 4+ sprints
  if (sprintNumber === 1) return 'awareness'
  if (sprintNumber === 2) return 'engagement'
  if (sprintNumber <= totalSprints - 1) return 'consideration'
  return 'conversion' // Last sprint
}

export async function POST(req: NextRequest) {
  try {
    const { campaignId } = await req.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    // Load campaign structure from database (same as execution planner)
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Fetch campaign with all related data
    const { data: campaign, error: campaignError } = await db
      .from('campaigns')
      .select('*, goals(*), segments(*), topics(*), narratives(*)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch segment_topic_matrix
    const segmentIds = (campaign.segments || []).map((s: any) => s.id)
    const topicIds = (campaign.topics || []).map((t: any) => t.id)

    const { data: matrixEntries } = segmentIds.length > 0 && topicIds.length > 0
      ? await db
          .from('segment_topic_matrix')
          .select('*')
          .in('segment_id', segmentIds)
          .in('topic_id', topicIds)
      : { data: [] }

    // Fetch campaign channels
    const { data: campaignChannels } = await db
      .from('campaign_channels')
      .select('channels(name)')
      .eq('campaign_id', campaignId)

    const channels = (campaignChannels || [])
      .map((cc: any) => cc.channels?.name)
      .filter((name: string | undefined): name is string => !!name)

    // Transform matrix entries to match schema format
    const segmentTopicMatrix = (matrixEntries || []).map((entry: any) => ({
      segment_id: entry.segment_id,
      topic_id: entry.topic_id,
      importance: entry.importance,
      role: entry.role,
      summary: entry.summary,
    }))

    // Check validation status (soft gate - doesn't block)
    const structure = {
      goals: campaign.goals || [],
      segments: campaign.segments || [],
      topics: campaign.topics || [],
      narratives: campaign.narratives || [],
      segment_topic_matrix: segmentTopicMatrix,
    }

    const readiness = isReadyForExecution(structure as any)
    if (!readiness.ready) {
      return NextResponse.json({
        error: 'Campaign structure not validated',
        message: 'Campaign structure must be validated before generating sprint plans',
        issues: readiness.issues,
      }, { status: 400 })
    }

    // Calculate campaign duration and sprint count
    const startDate = new Date(campaign.start_date)
    const endDate = new Date(campaign.end_date)
    const campaignDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const sprintCount = calculateSprintCount(campaignDurationDays)
    const sprintDateRanges = calculateSprintDateRanges(campaign.start_date, campaign.end_date, sprintCount)

    // Generate expected focus stage progression
    const expectedFocusStages: string[] = []
    for (let i = 1; i <= sprintCount; i++) {
      expectedFocusStages.push(getExpectedFocusStage(i, sprintCount))
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          sendSSE(controller, 'progress', {
            message: 'Kampány struktúra elemzése...',
          })

          sendSSE(controller, 'progress', {
            message: `Sprint szám meghatározása: ${sprintCount} sprint ${campaignDurationDays} napra...`,
          })

          // Get AI provider and model
          const provider = getAIProvider()
          const model = process.env.AI_MODEL

          if (!model) {
            throw new Error('AI_MODEL environment variable is not set')
          }

          // Prepare context for prompt
          const plannerContext: SprintPlannerContext = {
            campaign: {
              id: campaign.id,
              name: campaign.name || 'Unnamed Campaign',
              campaign_type: campaign.campaign_type || 'general',
              primary_goal_type: campaign.primary_goal_type || 'awareness',
              start_date: campaign.start_date || new Date().toISOString().split('T')[0],
              end_date: campaign.end_date || new Date().toISOString().split('T')[0],
              channels: channels.length > 0 ? channels : ['facebook', 'instagram'],
            },
            structure: structure as unknown as CampaignStructure,
            sprintCount,
            sprintDateRanges,
            expectedFocusStages,
            campaignDurationDays,
          }

          sendSSE(controller, 'progress', {
            message: `1. sprint generálása ${sprintCount}-ből...`,
          })

          // Generate sprint plans with AI (reuse existing logic but sprint-only prompt)
          const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1')
          const maxTokens = isReasoningModel ? 32768 : 8192 // Less tokens needed for sprints only

          const aiResponse = await provider.generateText({
            model,
            maxTokens,
            systemPrompt: SPRINT_PLANNER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: SPRINT_PLANNER_USER_PROMPT(plannerContext) }
            ],
          })

          if (!aiResponse.content) {
            throw new Error('Empty response from AI')
          }

          // Extract JSON from response (same logic as execution planner)
          let jsonContent = aiResponse.content.trim()
          if (jsonContent.includes('```')) {
            const lines = jsonContent.split('\n')
            const firstLine = lines[0]
            const lastLine = lines[lines.length - 1]
            if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
              jsonContent = lines.slice(1, -1).join('\n')
            }
          }

          // Parse JSON
          let sprintResponse: any
          try {
            sprintResponse = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            console.error('Raw output:', aiResponse.content.substring(0, 1000))
            throw new Error('Failed to parse AI response as JSON')
          }

          // Ensure response has sprints array
          if (!sprintResponse || typeof sprintResponse !== 'object') {
            throw new Error('Invalid sprint response structure')
          }
          if (!Array.isArray(sprintResponse.sprints)) {
            throw new Error('Response must contain sprints array')
          }

          sendSSE(controller, 'progress', {
            message: `Sprint validálás...`,
          })

          // Helper function to validate UUID
          const isValidUUID = (str: string | undefined | null): boolean => {
            if (!str || typeof str !== 'string') return false
            const uuidRegex = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/
            return uuidRegex.test(str)
          }

          // Get valid segment and topic IDs from structure
          const validSegmentIds = new Set(structure.segments.map(s => s.id).filter(isValidUUID))
          const validTopicIds = new Set((structure.topics || []).map(t => t.id).filter(isValidUUID))

          if (validSegmentIds.size === 0) {
            throw new Error('No valid segment IDs found in campaign structure')
          }
          if (validTopicIds.size === 0) {
            throw new Error('No valid topic IDs found in campaign structure')
          }

          // Process and validate sprints (same logic as execution planner)
          sprintResponse.sprints = sprintResponse.sprints.map((sprint: any, index: number) => {
            // Fix sprint ID
            const sprintId = isValidUUID(sprint.id) ? sprint.id : randomUUID()

            // Fix focus_segments - filter invalid UUIDs and keep only valid segment IDs
            const validFocusSegments = (sprint.focus_segments || [])
              .filter((id: string) => isValidUUID(id) && validSegmentIds.has(id))

            // Fix focus_topics - filter invalid UUIDs and keep only valid topic IDs
            const validFocusTopics = (sprint.focus_topics || [])
              .filter((id: string) => isValidUUID(id) && validTopicIds.has(id))

            // Ensure at least one segment and topic (required by schema)
            const finalFocusSegments = validFocusSegments.length > 0
              ? validFocusSegments
              : [Array.from(validSegmentIds)[0]]
            const finalFocusTopics = validFocusTopics.length > 0
              ? validFocusTopics
              : [Array.from(validTopicIds)[0]]

            return {
              ...sprint,
              id: sprintId,
              focus_segments: finalFocusSegments,
              focus_topics: finalFocusTopics,
            }
          })

          // Validate each sprint against enhanced schema
          const validatedSprints = []
          for (let i = 0; i < sprintResponse.sprints.length; i++) {
            try {
              const validatedSprint = SprintPlanSchema.parse(sprintResponse.sprints[i])
              validatedSprints.push(validatedSprint)
            } catch (validationError) {
              console.error(`Sprint ${i + 1} validation error:`, validationError)
              throw new Error(`Sprint ${i + 1} validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`)
            }
          }

          sendSSE(controller, 'progress', {
            message: 'Sprint generálás befejezve!',
          })

          // Send final event with sprints only (NO content_calendar)
          sendSSE(controller, 'done', {
            sprints: validatedSprints,
          })

          controller.close()
        } catch (error) {
          console.error('Sprint planner error:', error)
          sendSSE(controller, 'error', {
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Campaign sprints endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}