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
              budget_level: (campaign.budget_level as 'low' | 'medium' | 'high') || 'medium',
            },
            structure: structure as CampaignStructure,
          }

          // Generate execution plan with AI
          const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1')
          const maxTokens = isReasoningModel ? 32768 : 16384

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
          let executionPlan
          try {
            executionPlan = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            console.error('Raw output:', aiResponse.content)
            throw new Error('Failed to parse AI response as JSON')
          }

          // Ensure all IDs are UUIDs (AI might not generate proper UUIDs)
          executionPlan.sprints = executionPlan.sprints.map((sprint: any) => ({
            ...sprint,
            id: sprint.id || randomUUID(),
          }))

          executionPlan.content_calendar = executionPlan.content_calendar.map((slot: any) => ({
            ...slot,
            id: slot.id || randomUUID(),
            status: slot.status || 'planned',
          }))

          // Validate against schema
          try {
            executionPlan = ExecutionPlanSchema.parse(executionPlan)
          } catch (validationError) {
            console.error('Schema validation error:', validationError)
            console.error('Parsed plan:', executionPlan)
            throw new Error(`Validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`)
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

