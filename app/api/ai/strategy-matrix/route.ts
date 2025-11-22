import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { STRATEGY_GENERATOR_SYSTEM_PROMPT, STRATEGY_GENERATOR_USER_PROMPT, StrategyGenerationContext } from '@/lib/ai/prompts/strategy-generator'
import { MessageGenerationRequestSchema, MessageStrategySchema, MessageStrategy } from '@/lib/ai/schemas'
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

    const client = getAnthropicClient()
    const generatedStrategies: Array<{ segment_id: string; topic_id: string; strategy: MessageStrategy }> = []

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

    // Generate strategies for each segment × topic combination
    for (const segment of segments) {
      for (const topic of topics) {
        const comboKey = `${segment.id}:${topic.id}`
        const shouldRegenerate = regenerateSet.size > 0 ? regenerateSet.has(comboKey) : true

        // Skip if specific combinations requested and this isn't one
        if (!shouldRegenerate && regenerateSet.size > 0) {
          continue
        }

        const context: StrategyGenerationContext = {
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
            model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
            max_tokens: 2048,
            system: STRATEGY_GENERATOR_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: STRATEGY_GENERATOR_USER_PROMPT(context) }
            ]
          })

          const content = response.content[0].type === 'text' 
            ? response.content[0].text 
            : ''

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

          let strategyData
          try {
            strategyData = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error(`JSON parse error for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, parseError)
            console.error('Raw output:', content)
            console.error('Extracted JSON:', jsonContent)
            continue
          }

          // Validate strategy
          try {
            // Generate preview summary if not present (though prompt should ideally handle it, we can generate it here or let the UI handle it)
            // For now, we'll just validate the core structure. The schema has preview_summary as optional.
            
            // We need to remove preview_summary if it's not in the AI output to avoid validation error if we were to strictly require it, 
            // but the schema says optional.
            
            // Construct the preview summary manually if missing, as per AC #5
            if (!strategyData.preview_summary) {
                const pos = strategyData.strategy_core?.positioning_statement || '';
                const core = strategyData.strategy_core?.core_message || '';
                const tone = strategyData.style_tone?.tone_profile?.keywords?.join(', ') || '';
                const stage = strategyData.cta_funnel?.funnel_stage || '';
                
                // Simple truncation for summary
                const posSummary = pos.split('.').slice(0, 2).join('.') + '.';
                
                strategyData.preview_summary = `Positioning: ${posSummary} Core: ${core} Tone: ${tone}. Stage: ${stage}`;
            }

            const validatedStrategy = MessageStrategySchema.parse(strategyData)
            
            generatedStrategies.push({
              segment_id: segment.id,
              topic_id: topic.id,
              strategy: validatedStrategy
            })
          } catch (validationError) {
            console.error(`Validation error for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, validationError)
            console.error('Parsed strategyData:', strategyData)
            console.error('Raw output:', content)
            continue
          }
        } catch (error) {
          console.error(`Error generating strategy for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, error)
          // Continue with next combination
          continue
        }
      }
    }

    if (generatedStrategies.length === 0) {
      console.error('No strategies generated. Total combinations attempted:', segments.length * topics.length)
      return NextResponse.json({ 
        error: 'Failed to generate any strategies',
        details: `Attempted ${segments.length * topics.length} combinations but none succeeded. Check server logs for details.`
      }, { status: 500 })
    }

    return NextResponse.json({ strategies: generatedStrategies })

  } catch (error) {
    console.error('Strategy Generation Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
