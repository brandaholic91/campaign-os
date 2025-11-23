import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { MESSAGE_GENERATOR_SYSTEM_PROMPT, MESSAGE_GENERATOR_USER_PROMPT, MessageGenerationContext } from '@/lib/ai/prompts/message-generator'
import { MessageGenerationRequestSchema, validateGeneratedMessage } from '@/lib/ai/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, segment_ids, topic_ids, regenerate_combinations } = MessageGenerationRequestSchema.parse(body)
    
    // Parse regenerate combinations if provided
    const regenerateSet = new Set<string>()
    if (regenerate_combinations && Array.isArray(regenerate_combinations)) {
      regenerate_combinations.forEach((combo: string) => {
        const trimmed = combo.trim()
        if (trimmed) regenerateSet.add(trimmed)
      })
    }

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

    const provider = getAIProvider()
    const model = process.env.AI_MODEL
    
    if (!model) {
      return NextResponse.json({ 
        error: 'AI_MODEL environment variable is not set',
        details: 'Please set the AI_MODEL environment variable to use AI features'
      }, { status: 500 })
    }

    // Reasoning modelleknél (gpt-5, o1) több token kell, mert a reasoning tokenek is beleszámítanak
    const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1');
    const maxTokens = isReasoningModel ? 4096 : 1024; // Reasoning modelleknél több token, hogy legyen hely a válasznak

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
        const comboKey = `${segment.id}:${topic.id}`
        const shouldRegenerate = regenerateSet.size > 0 ? regenerateSet.has(comboKey) : true

        // Skip if specific combinations requested and this isn't one
        if (!shouldRegenerate && regenerateSet.size > 0) {
          continue
        }

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
          const response = await provider.generateText({
            model,
            maxTokens,
            systemPrompt: MESSAGE_GENERATOR_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: MESSAGE_GENERATOR_USER_PROMPT(context) }
            ]
          })

          const content = response.content

          if (!content) {
            console.warn(`Empty response for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id})`)
            continue
          }

          // Extract JSON from response (handle markdown code blocks)
          let jsonContent = content.trim()
          
          // Remove markdown code blocks if present
          if (jsonContent.startsWith('```')) {
            const lines = jsonContent.split('\n')
            const firstLine = lines[0]
            const lastLine = lines[lines.length - 1]
            
            // Remove first and last line if they are code block markers
            if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
              jsonContent = lines.slice(1, -1).join('\n')
            }
          }

          let messageData
          try {
            messageData = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error(`JSON parse error for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, parseError)
            console.error('Raw output:', content)
            console.error('Extracted JSON:', jsonContent)
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
            console.error(`Validation error for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, validationError)
            console.error('Parsed messageData:', messageData)
            console.error('Raw output:', content)
            continue
          }
        } catch (error) {
          console.error(`Error generating message for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, error)
          // Continue with next combination
          continue
        }
      }
    }

    if (generatedMessages.length === 0) {
      console.error('No messages generated. Total combinations attempted:', segments.length * topics.length)
      console.error('Segments:', segments.map(s => s.name))
      console.error('Topics:', topics.map(t => t.name))
      return NextResponse.json({ 
        error: 'Failed to generate any messages',
        details: `Attempted ${segments.length * topics.length} combinations but none succeeded. Check server logs for details.`
      }, { status: 500 })
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

