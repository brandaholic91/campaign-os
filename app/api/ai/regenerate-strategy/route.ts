import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { STRATEGY_GENERATOR_SYSTEM_PROMPT, STRATEGY_GENERATOR_USER_PROMPT, StrategyGenerationContext } from '@/lib/ai/prompts/strategy-generator'
import { MessageStrategySchema, MessageStrategy } from '@/lib/ai/schemas'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/ai/regenerate-strategy
 * 
 * Regenerates a single communication strategy for a specific segment × topic combination.
 * Does NOT save the strategy - returns it for preview/comparison only.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, segment_id, topic_id } = body

    if (!campaign_id || !segment_id || !topic_id) {
      return NextResponse.json({ 
        error: 'campaign_id, segment_id, and topic_id are required' 
      }, { status: 400 })
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

    // Type assertion for narratives field
    const campaignData = campaign as any

    // Fetch segment
    const { data: segment, error: segmentError } = await db
      .from('segments')
      .select('*')
      .eq('id', segment_id)
      .eq('campaign_id', campaign_id)
      .single()

    if (segmentError || !segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    // Fetch topic
    const { data: topic, error: topicError } = await db
      .from('topics')
      .select('*')
      .eq('id', topic_id)
      .eq('campaign_id', campaign_id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

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

    // Build context for AI generation
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

    // Generate strategy using AI
    const client = getAnthropicClient()
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
      return NextResponse.json({ 
        error: 'Empty response from AI' 
      }, { status: 500 })
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content.trim()
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      const lines = jsonContent.split('\n')
      const firstLine = lines[0]
      const lastLine = lines[lines.length - 1]
      
      if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
        jsonContent = lines.slice(1, -1).join('\n')
      }
    }

    // Parse JSON
    let strategyData
    try {
      strategyData = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw output:', content)
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        details: 'Invalid JSON format'
      }, { status: 500 })
    }

    // Generate preview summary if not present
    if (!strategyData.preview_summary) {
      const pos = strategyData.strategy_core?.positioning_statement || ''
      const core = strategyData.strategy_core?.core_message || ''
      const tone = strategyData.style_tone?.tone_profile?.keywords?.join(', ') || ''
      const stage = strategyData.cta_funnel?.funnel_stage || ''
      
      const posSummary = pos.split('.').slice(0, 2).join('.') + '.'
      strategyData.preview_summary = `Positioning: ${posSummary} Core: ${core} Tone: ${tone}. Stage: ${stage}`
    }

    // Validate strategy
    try {
      const validatedStrategy = MessageStrategySchema.parse(strategyData)
      
      return NextResponse.json({ 
        strategy: validatedStrategy,
        segment_id,
        topic_id
      })
    } catch (validationError) {
      console.error('Validation error:', validationError)
      console.error('Strategy data:', strategyData)
      return NextResponse.json({ 
        error: 'Strategy validation failed',
        details: validationError instanceof Error ? validationError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Strategy Regeneration Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
