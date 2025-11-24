import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { isReadyForExecution } from '@/lib/validation/campaign-structure'
import { ExecutionPlanSchema, CampaignStructure } from '@/lib/ai/schemas'
import { EXECUTION_PLANNER_SYSTEM_PROMPT, EXECUTION_PLANNER_USER_PROMPT, ExecutionPlannerContext } from '@/lib/ai/prompts/execution-planner'
import { enforceConstraints } from '@/lib/ai/execution-planner'
import { randomUUID } from 'crypto'

export const maxDuration = 120 // 2 minutes for complex execution plan generation

/**
 * SSE helper to send progress events
 */
function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const encoder = new TextEncoder()
  const event = `data: ${JSON.stringify({ type, ...data })}\n\n`
  controller.enqueue(encoder.encode(event))
}

export async function POST(req: NextRequest) {
  try {
    const { campaignId } = await req.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    // Load campaign structure from database
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

    // Transform matrix entries to match schema format (with segment_id and topic_id)
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
    const validationWarning = readiness.ready
      ? null
      : {
          message: 'Campaign structure is not fully validated',
          issues: readiness.issues,
        }

    // Create SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send validation warning if needed (soft gate - continue anyway)
          if (validationWarning) {
            sendSSE(controller, 'warning', {
              step: 'validation',
              message: 'Figyelem: A kampány struktúra nem teljesen validált',
              issues: validationWarning.issues,
            })
          }

          // Send initial progress
          sendSSE(controller, 'progress', {
            step: 'sprint_planning',
            message: 'Sprint tervezés...',
          })

          // Get AI provider and model
          const provider = getAIProvider()
          const model = process.env.AI_MODEL

          if (!model) {
            throw new Error('AI_MODEL environment variable is not set')
          }

          // Prepare context for prompt
          const plannerContext: ExecutionPlannerContext = {
            campaign: {
              id: campaign.id,
              name: campaign.name || 'Unnamed Campaign',
              campaign_type: campaign.campaign_type || 'general',
              primary_goal_type: campaign.primary_goal_type || 'awareness',
              start_date: campaign.start_date || new Date().toISOString().split('T')[0],
              end_date: campaign.end_date || new Date().toISOString().split('T')[0],
              channels: channels.length > 0 ? channels : ['facebook', 'instagram'], // Fallback if no channels
              budget_level: 'medium', // Default budget level (budget_estimate available but no budget_level field in DB)
            },
            structure: structure as unknown as CampaignStructure,
          }

          // Generate execution plan with AI
          const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1')
          // For reasoning models, use higher limit but cap at reasonable amount to avoid empty responses
          // Reasoning models use reasoning tokens, so we need higher limit for actual output
          const maxTokens = isReasoningModel ? 65536 : 16384

          const aiResponse = await provider.generateText({
            model,
            maxTokens,
            systemPrompt: EXECUTION_PLANNER_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: EXECUTION_PLANNER_USER_PROMPT(plannerContext) }
            ],
          })

          if (!aiResponse.content) {
            throw new Error('Empty response from AI')
          }

          // Check if response was cut off due to token limit
          if (aiResponse.usage && aiResponse.usage.completionTokens >= (maxTokens * 0.95)) {
            console.warn(
              `AI response may have been cut off: ${aiResponse.usage.completionTokens}/${maxTokens} tokens used`
            )
          }

          // Extract JSON from response (handle markdown code blocks)
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
          let executionPlan: any
          try {
            executionPlan = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            console.error('Raw output:', aiResponse.content.substring(0, 1000))
            throw new Error('Failed to parse AI response as JSON')
          }

          // Ensure executionPlan has required structure
          if (!executionPlan || typeof executionPlan !== 'object') {
            throw new Error('Invalid execution plan structure')
          }
          if (!Array.isArray(executionPlan.sprints)) {
            executionPlan.sprints = []
          }
          if (!Array.isArray(executionPlan.content_calendar)) {
            executionPlan.content_calendar = []
          }

          // Helper function to validate UUID (matches Zod's UUID validation)
          const isValidUUID = (str: string | undefined | null): boolean => {
            if (!str || typeof str !== 'string') return false
            // Zod uses a more permissive UUID regex that allows 00000000-0000-0000-0000-000000000000 and ffffffff-ffff-ffff-ffff-ffffffffffff
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

          // Ensure all sprint IDs are valid UUIDs
          executionPlan.sprints = executionPlan.sprints.map((sprint: any, index: number) => {
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

          // Create a map of sprint IDs for validation
          const sprintIdMap = new Set(executionPlan.sprints.map((s: any) => s.id))

          if (sprintIdMap.size === 0) {
            throw new Error('No valid sprints generated')
          }

          // Check if content_calendar is empty (AI response might have been cut off)
          if (!executionPlan.content_calendar || executionPlan.content_calendar.length === 0) {
            console.warn('Content calendar is empty - AI response may have been cut off due to token limit')
            throw new Error(
              'Az AI válasza le lett vágva a token limit miatt, és a tartalomnaptár nem lett generálva. ' +
              'Kérlek, próbáld újra, vagy használj egy másik AI modellt.'
            )
          }

          // Ensure all content calendar IDs are valid UUIDs
          executionPlan.content_calendar = executionPlan.content_calendar.map((slot: any) => {
            // Fix slot ID
            const slotId = isValidUUID(slot.id) ? slot.id : randomUUID()
            
            // Fix sprint_id - must match a valid sprint ID
            let validSprintId = slot.sprint_id
            if (!isValidUUID(validSprintId) || !sprintIdMap.has(validSprintId)) {
              // Fallback to first sprint if invalid
              validSprintId = Array.from(sprintIdMap)[0] as string
            }
            
            // Fix primary_segment_id - must be a valid segment ID or undefined
            let validPrimarySegmentId = slot.primary_segment_id
            if (validPrimarySegmentId !== undefined && validPrimarySegmentId !== null) {
              if (!isValidUUID(validPrimarySegmentId) || !validSegmentIds.has(validPrimarySegmentId)) {
                validPrimarySegmentId = undefined // Remove invalid segment ID
              }
            }
            
            // Fix primary_topic_id - must be a valid topic ID or undefined
            let validPrimaryTopicId = slot.primary_topic_id
            if (validPrimaryTopicId !== undefined && validPrimaryTopicId !== null) {
              if (!isValidUUID(validPrimaryTopicId) || !validTopicIds.has(validPrimaryTopicId)) {
                validPrimaryTopicId = undefined // Remove invalid topic ID
              }
            }
            
            // Fix content_type - normalize invalid values to valid ones
            const validContentTypes = [
              'short_video',
              'story',
              'static_image',
              'carousel',
              'live',
              'long_post',
              'email'
            ] as const
            
            let validContentType = slot.content_type
            if (!validContentTypes.includes(validContentType as any)) {
              // Map common invalid values to valid ones
              const contentTypeMap: Record<string, typeof validContentTypes[number]> = {
                'long_form_video': 'long_post',
                'video': 'short_video',
                'post': 'long_post',
                'image': 'static_image',
                'photo': 'static_image',
                'reel': 'short_video',
                'tiktok': 'short_video',
              }
              
              validContentType = contentTypeMap[validContentType?.toLowerCase() || ''] || 'long_post'
              console.warn(
                `Invalid content_type "${slot.content_type}" normalized to "${validContentType}" for slot ${slotId}`
              )
            }
            
            // Fix objective - normalize invalid values to valid ones
            const validObjectives = [
              'reach',
              'engagement',
              'traffic',
              'lead',
              'conversion',
              'mobilization'
            ] as const
            
            let validObjective = slot.objective
            if (!validObjectives.includes(validObjective as any)) {
              // Map common invalid values to valid ones
              const objectiveMap: Record<string, typeof validObjectives[number]> = {
                'awareness': 'reach',
                'aware': 'reach',
                'click': 'traffic',
                'clicks': 'traffic',
                'action': 'conversion',
                'actions': 'conversion',
                'mobilize': 'mobilization',
                'mobilizing': 'mobilization',
              }
              
              validObjective = objectiveMap[validObjective?.toLowerCase() || ''] || 'engagement'
              console.warn(
                `Invalid objective "${slot.objective}" normalized to "${validObjective}" for slot ${slotId}`
              )
            }
            
            return {
              ...slot,
              id: slotId,
              sprint_id: validSprintId,
              primary_segment_id: validPrimarySegmentId,
              primary_topic_id: validPrimaryTopicId,
              content_type: validContentType,
              objective: validObjective,
              status: slot.status || 'planned',
            }
          })

          // Validate against schema
          try {
            executionPlan = ExecutionPlanSchema.parse(executionPlan)
          } catch (validationError) {
            console.error('Schema validation error:', validationError)
            console.error('Parsed plan:', JSON.stringify(executionPlan, null, 2))
            
            // Provide more helpful error message
            const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown error'
            if (errorMessage.includes('content_calendar') && errorMessage.includes('too_small')) {
              throw new Error(
                'Az AI válasza le lett vágva a token limit miatt, és a tartalomnaptár nem lett teljesen generálva. ' +
                'Kérlek, próbáld újra, vagy használj egy másik AI modellt (pl. nem reasoning modellt).'
              )
            }
            
            throw new Error(`Validation failed: ${errorMessage}`)
          }

          // Send progress after sprint planning
          sendSSE(controller, 'progress', {
            step: 'sprint_planning',
            message: `${executionPlan.sprints.length} sprint generálva`,
            sprints: executionPlan.sprints,
          })

          // Send progress for content calendar
          sendSSE(controller, 'progress', {
            step: 'content_calendar',
            message: 'Tartalomnaptár generálása...',
          })

          // Enforce constraints (post-processing)
          const enforcementResult = enforceConstraints(executionPlan, plannerContext.campaign.channels)

          // Send warnings if any
          if (enforcementResult.warnings.length > 0) {
            sendSSE(controller, 'warning', {
              step: 'constraint_enforcement',
              message: `${enforcementResult.warnings.length} slot módosítva vagy eltávolítva`,
              warnings: enforcementResult.warnings,
            })
          }

          // Send progress after content calendar
          sendSSE(controller, 'progress', {
            step: 'content_calendar',
            message: `${enforcementResult.plan.content_calendar.length} slot generálva`,
            slots: enforcementResult.plan.content_calendar.length,
          })

          // Send complete event with final plan
          sendSSE(controller, 'complete', {
            executionPlan: enforcementResult.plan,
          })

          controller.close()
        } catch (error) {
          console.error('Execution planner error:', error)
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
    console.error('Campaign execution endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

