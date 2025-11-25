import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { ContentDraftSchema } from '@/lib/ai/schemas'
import {
  CONTENT_DRAFT_GENERATOR_SYSTEM_PROMPT,
  CONTENT_DRAFT_GENERATOR_USER_PROMPT,
  ContentDraftGeneratorContext
} from '@/lib/ai/prompts/content-draft-generator'
import { z } from 'zod'
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

/**
 * Request body schema
 */
const RequestBodySchema = z.object({
  variant_count: z.number().min(1).max(3).optional().default(1),
  tone_preference: z.string().optional()
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params
    const body = await req.json().catch(() => ({}))

    // Validate request body
    const validatedBody = RequestBodySchema.parse(body)
    const { variant_count, tone_preference } = validatedBody

    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // 1. Fetch content slot with all relationships
    const { data: slot, error: slotError } = await db
      .from('content_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Content slot not found' }, { status: 404 })
    }

    // 2. Validate slot has required metadata
    if (!slot.primary_segment_id || !slot.primary_topic_id || !slot.funnel_stage) {
      return NextResponse.json(
        { error: 'Content slot missing required metadata (primary_segment_id, primary_topic_id, or funnel_stage)' },
        { status: 400 }
      )
    }

    // 3. Load primary segment with full profile
    const { data: primarySegment } = await db
      .from('segments')
      .select('id, name, demographic_profile, psychographic_profile, media_habits')
      .eq('id', slot.primary_segment_id)
      .single()

    // 4. Load secondary segments (if any)
    const secondarySegments: any[] = []
    if (slot.secondary_segment_ids && Array.isArray(slot.secondary_segment_ids) && slot.secondary_segment_ids.length > 0) {
      const segmentIds = slot.secondary_segment_ids.filter((id): id is string => typeof id === 'string')
      if (segmentIds.length > 0) {
        const { data: secSegs } = await db
          .from('segments')
          .select('id, name')
          .in('id', segmentIds)

        if (secSegs) {
          secondarySegments.push(...secSegs)
        }
      }
    }

    // 5. Load primary topic with narrative and angles
    const { data: primaryTopic } = await db
      .from('topics')
      .select('id, name, core_narrative, content_angles')
      .eq('id', slot.primary_topic_id)
      .single()

    // 6. Load secondary topics (if any)
    const secondaryTopics: any[] = []
    if (slot.secondary_topic_ids && Array.isArray(slot.secondary_topic_ids) && slot.secondary_topic_ids.length > 0) {
      const topicIds = slot.secondary_topic_ids.filter((id): id is string => typeof id === 'string')
      if (topicIds.length > 0) {
        const { data: secTopics } = await db
          .from('topics')
          .select('id, name')
          .in('id', topicIds)

        if (secTopics) {
          secondaryTopics.push(...secTopics)
        }
      }
    }

    // 7. Load related goals
    const relatedGoals: any[] = []
    if (slot.related_goal_ids && Array.isArray(slot.related_goal_ids) && slot.related_goal_ids.length > 0) {
      const goalIds = slot.related_goal_ids.filter((id): id is string => typeof id === 'string')
      if (goalIds.length > 0) {
        const { data: goals } = await db
          .from('goals')
          .select('id, title, funnel_stage, kpi_hint')
          .in('id', goalIds)

        if (goals) {
          relatedGoals.push(...goals)
        }
      }
    }

    // 8. Load message strategy (CRITICAL) for primary segment × primary topic
    let messageStrategy: any = null

    // Try primary segment × primary topic first
    const { data: strategyData } = await db
      .from('message_strategies')
      .select('*')
      .eq('campaign_id', slot.campaign_id)
      .eq('segment_id', slot.primary_segment_id)
      .eq('topic_id', slot.primary_topic_id)
      .single()

    if (strategyData) {
      messageStrategy = strategyData
    } else {
      // Fallback: try secondary segment × primary topic
      if (slot.secondary_segment_ids && Array.isArray(slot.secondary_segment_ids) && slot.secondary_segment_ids.length > 0) {
        const secSegIds = slot.secondary_segment_ids.filter((id): id is string => typeof id === 'string')
        for (const secSegId of secSegIds) {
          const { data: secStrategyData } = await db
            .from('message_strategies')
            .select('*')
            .eq('campaign_id', slot.campaign_id)
            .eq('segment_id', secSegId)
            .eq('topic_id', slot.primary_topic_id)
            .single()

          if (secStrategyData) {
            messageStrategy = secStrategyData
            break
          }
        }
      }

      // Fallback: try primary segment × secondary topic
      if (!messageStrategy && slot.secondary_topic_ids && Array.isArray(slot.secondary_topic_ids) && slot.secondary_topic_ids.length > 0) {
        const secTopicIds = slot.secondary_topic_ids.filter((id): id is string => typeof id === 'string')
        for (const secTopicId of secTopicIds) {
          const { data: secStrategyData } = await db
            .from('message_strategies')
            .select('*')
            .eq('campaign_id', slot.campaign_id)
            .eq('segment_id', slot.primary_segment_id)
            .eq('topic_id', secTopicId)
            .single()

          if (secStrategyData) {
            messageStrategy = secStrategyData
            break
          }
        }
      }
    }

    // 9. Build context for AI prompt
    const context: ContentDraftGeneratorContext = {
      slot: {
        id: slot.id,
        date: slot.date,
        channel: slot.channel,
        content_type: slot.content_type,
        objective: slot.objective,
        funnel_stage: slot.funnel_stage,
        angle_type: slot.angle_type,
        angle_hint: slot.angle_hint ?? undefined,
        cta_type: slot.cta_type,
        tone_override: slot.tone_override ?? undefined,
        time_of_day: slot.time_of_day ?? undefined,
        notes: slot.notes ?? undefined
      },
      primary_segment: primarySegment ? {
        id: primarySegment.id,
        name: primarySegment.name,
        demographic_profile: primarySegment.demographic_profile,
        psychographic_profile: primarySegment.psychographic_profile,
        media_habits: primarySegment.media_habits
      } : undefined,
      secondary_segments: secondarySegments.length > 0 ? secondarySegments : undefined,
      primary_topic: primaryTopic ? {
        id: primaryTopic.id,
        name: primaryTopic.name,
        core_narrative: primaryTopic.core_narrative ?? undefined,
        content_angles: Array.isArray(primaryTopic.content_angles)
          ? primaryTopic.content_angles.filter((a): a is string => typeof a === 'string')
          : undefined
      } : undefined,
      secondary_topics: secondaryTopics.length > 0 ? secondaryTopics : undefined,
      related_goals: relatedGoals.length > 0 ? relatedGoals.map(g => ({
        id: g.id,
        title: g.title,
        funnel_stage: g.funnel_stage ?? undefined,
        kpi_hint: g.kpi_hint ?? undefined
      })) : undefined,
      message_strategy: messageStrategy ? {
        strategy_core: messageStrategy.strategy_core,
        style_tone: messageStrategy.style_tone,
        cta_funnel: messageStrategy.cta_funnel,
        extra_fields: messageStrategy.extra_fields
      } : undefined,
      variant_count,
      tone_preference
    }

    // 10. Generate content drafts using AI with streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          sendSSE(controller, 'progress', { message: `Draft generálás indítása (${variant_count} variáns)...` })

          const aiProvider = getAIProvider()

          // Prepare prompts
          const systemPrompt = CONTENT_DRAFT_GENERATOR_SYSTEM_PROMPT.replace('{variant_count}', variant_count.toString())
          const userPrompt = CONTENT_DRAFT_GENERATOR_USER_PROMPT(context)

          // Stream AI response
          const aiStream = aiProvider.generateStream({
            systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            maxTokens: 4000
          })

          let fullResponse = ''
          let chunkCount = 0

          for await (const chunk of aiStream) {
            fullResponse += chunk.content
            chunkCount++

            // Send progress every 10 chunks
            if (chunkCount % 10 === 0) {
              sendSSE(controller, 'progress', { message: `Draft generálás folyamatban... (${chunkCount} chunk)` })
            }
          }

          sendSSE(controller, 'progress', { message: 'AI válasz feldolgozása...' })

          // Parse JSON response
          let parsedResponse
          try {
            // Try to extract JSON from response (in case there's extra text)
            const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              parsedResponse = JSON.parse(jsonMatch[0])
            } else {
              parsedResponse = JSON.parse(fullResponse)
            }
          } catch (jsonError) {
            // Try jsonrepair
            try {
              const repairedJson = jsonrepair(fullResponse)
              parsedResponse = JSON.parse(repairedJson)
            } catch (repairError) {
              throw new Error('Failed to parse AI response as JSON')
            }
          }

          // Validate response structure
          if (!parsedResponse.drafts || !Array.isArray(parsedResponse.drafts)) {
            throw new Error('AI response missing "drafts" array')
          }

          const drafts = parsedResponse.drafts

          // Validate each draft against ContentDraftSchema
          sendSSE(controller, 'progress', { message: 'Draft-ok validálása...' })

          const validatedDrafts = []
          for (let i = 0; i < drafts.length; i++) {
            try {
              const draft = drafts[i]

              // Add required fields
              const draftToValidate = {
                ...draft,
                slot_id: slotId,
                created_by: 'ai',
                status: 'draft',
                variant_name: draft.variant_name || `Variáns ${i + 1}`
              }

              const validatedDraft = ContentDraftSchema.parse(draftToValidate)
              validatedDrafts.push(validatedDraft)

              sendSSE(controller, 'progress', { message: `Draft ${i + 1}/${drafts.length} validálva` })
            } catch (validationError: any) {
              console.error(`Draft ${i + 1} validation error:`, validationError.message)
              sendSSE(controller, 'error', { message: `Draft ${i + 1} validálási hiba: ${validationError.message}` })
            }
          }

          if (validatedDrafts.length === 0) {
            throw new Error('No valid drafts generated')
          }

          // 11. Save drafts to database
          sendSSE(controller, 'progress', { message: `${validatedDrafts.length} draft mentése adatbázisba...` })

          const savedDrafts = []
          for (let i = 0; i < validatedDrafts.length; i++) {
            const draft = validatedDrafts[i]

            // Remove id field (will be generated by database)
            const { id, created_at, updated_at, ...draftToInsert } = draft

            const { data: savedDraft, error: insertError } = await db
              .from('content_drafts')
              .insert(draftToInsert)
              .select()
              .single()

            if (insertError) {
              console.error(`Draft ${i + 1} insert error:`, insertError.message)
              sendSSE(controller, 'error', { message: `Draft ${i + 1} mentési hiba: ${insertError.message}` })
              continue
            }

            savedDrafts.push(savedDraft)
            sendSSE(controller, 'progress', { message: `Draft ${i + 1}/${validatedDrafts.length} elmentve` })
          }

          // 12. Send final response
          sendSSE(controller, 'complete', { drafts: savedDrafts })

          controller.close()
        } catch (error: any) {
          console.error('Content draft generation error:', error)
          sendSSE(controller, 'error', { message: error.message || 'Failed to generate content drafts' })
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error: any) {
    console.error('Content draft generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate content drafts' },
      { status: 500 }
    )
  }
}
