import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { MESSAGE_GENERATOR_SYSTEM_PROMPT, MESSAGE_GENERATOR_USER_PROMPT, MessageGenerationContext } from '@/lib/ai/prompts/message-generator'
import { MessageGenerationRequestSchema, GeneratedMessageSchema, validateGeneratedMessage } from '@/lib/ai/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, segment_ids, topic_ids } = MessageGenerationRequestSchema.parse(body)

    if (!segment_ids.length || !topic_ids.length) {
      return NextResponse.json({ error: 'At least one segment and topic required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Type assertion for narratives field which may not be in generated types
    const campaignData = campaign as any

    // Fetch segments and topics
    const { data: segments } = await db
      .from('segments')
      .select('*')
      .in('id', segment_ids)
      .eq('campaign_id', campaign_id)

    const { data: topics } = await db
      .from('topics')
      .select('*')
      .in('id', topic_ids)
      .eq('campaign_id', campaign_id)

    if (!segments || !topics || segments.length === 0 || topics.length === 0) {
      return NextResponse.json({ error: 'Segments or topics not found' }, { status: 404 })
    }

    const client = getAnthropicClient()
    const generatedMessages: Array<{ segment_id: string; topic_id: string; headline: string; body: string; proof_point?: string; cta?: string; message_type: 'core' | 'supporting' | 'contrast' }> = []

    // Parse narratives if available
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

    // Generate messages for each segment × topic combination
    for (const segment of segments) {
      for (const topic of topics) {
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

        try {
          const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
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
            console.warn(`Empty response for segment ${segment.id}, topic ${topic.id}`)
            continue
          }

          let messageData
          try {
            messageData = JSON.parse(content)
            // Validate and add campaign_id
            const validated = validateGeneratedMessage({
              ...messageData,
              campaign_id,
            })
            generatedMessages.push(validated)
          } catch (e) {
            console.error(`Validation error for segment ${segment.id}, topic ${topic.id}:`, e)
            console.error('Raw output:', content)
            // Continue with next combination instead of failing entire batch
            continue
          }
        } catch (error) {
          console.error(`Error generating message for segment ${segment.id}, topic ${topic.id}:`, error)
          // Continue with next combination
          continue
        }
      }
    }

    if (generatedMessages.length === 0) {
      return NextResponse.json({ error: 'Failed to generate any messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: generatedMessages })

  } catch (error) {
    console.error('Message Generation Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

