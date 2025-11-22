import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MessageStrategySchema } from '@/lib/ai/schemas'
import { z } from 'zod'

// Request schema for creating a strategy
const CreateStrategyRequestSchema = z.object({
  campaign_id: z.string().uuid(),
  segment_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  strategy_core: MessageStrategySchema.shape.strategy_core,
  style_tone: MessageStrategySchema.shape.style_tone,
  cta_funnel: MessageStrategySchema.shape.cta_funnel,
  extra_fields: MessageStrategySchema.shape.extra_fields.optional(),
  preview_summary: z.string().optional(),
})

// GET /api/strategies?campaign_id=... - List all strategies for a campaign
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing required parameter: campaign_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Fetch strategies with segment and topic names via JOIN
    const { data, error } = await db
      .from('message_strategies')
      .select(`
        id,
        campaign_id,
        segment_id,
        topic_id,
        strategy_core,
        style_tone,
        cta_funnel,
        extra_fields,
        preview_summary,
        created_at,
        updated_at,
        segments!segment_id (
          id,
          name
        ),
        topics!topic_id (
          id,
          name
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching strategies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch strategies', details: error.message },
        { status: 500 }
      )
    }

    // Transform data to include segment_name and topic_name
    const transformedData = (data || []).map((strategy: any) => ({
      id: strategy.id,
      campaign_id: strategy.campaign_id,
      segment_id: strategy.segment_id,
      topic_id: strategy.topic_id,
      segment_name: strategy.segments?.name || 'Unknown',
      topic_name: strategy.topics?.name || 'Unknown',
      content: {
        strategy_core: strategy.strategy_core,
        style_tone: strategy.style_tone,
        cta_funnel: strategy.cta_funnel,
        extra_fields: strategy.extra_fields,
        preview_summary: strategy.preview_summary,
      },
      created_at: strategy.created_at,
      updated_at: strategy.updated_at,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/strategies - Create a new strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = CreateStrategyRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { 
      campaign_id, 
      segment_id, 
      topic_id, 
      strategy_core, 
      style_tone, 
      cta_funnel, 
      extra_fields,
      preview_summary 
    } = validationResult.data

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Insert new strategy
    const { data, error } = await db
      .from('message_strategies')
      .insert({
        campaign_id,
        segment_id,
        topic_id,
        strategy_core,
        style_tone,
        cta_funnel,
        extra_fields: extra_fields || null,
        preview_summary: preview_summary || null,
      })
      .select()
      .single()

    if (error) {
      // Handle UNIQUE constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Strategy already exists for this segment × topic combination' },
          { status: 409 }
        )
      }

      console.error('Error creating strategy:', error)
      return NextResponse.json(
        { error: 'Failed to create strategy', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
