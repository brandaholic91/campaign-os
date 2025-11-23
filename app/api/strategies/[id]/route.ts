import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MessageStrategySchema } from '@/lib/ai/schemas'
import { z } from 'zod'

// Request schema for updating a strategy
const UpdateStrategyRequestSchema = z.object({
  strategy_core: MessageStrategySchema.shape.strategy_core.optional(),
  style_tone: MessageStrategySchema.shape.style_tone.optional(),
  cta_funnel: MessageStrategySchema.shape.cta_funnel.optional(),
  extra_fields: MessageStrategySchema.shape.extra_fields.optional(),
  preview_summary: z.string().optional(),
})

// GET /api/strategies/[id] - Get a single strategy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Fetch strategy with segment and topic names
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Strategy not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching strategy:', error)
      return NextResponse.json(
        { error: 'Failed to fetch strategy', details: error.message },
        { status: 500 }
      )
    }

    // Transform data to include segment_name and topic_name
    const transformedData = {
      id: data.id,
      campaign_id: data.campaign_id,
      segment_id: data.segment_id,
      topic_id: data.topic_id,
      segment_name: (data.segments as any)?.name || 'Unknown',
      topic_name: (data.topics as any)?.name || 'Unknown',
      content: {
        strategy_core: data.strategy_core,
        style_tone: data.style_tone,
        cta_funnel: data.cta_funnel,
        extra_fields: data.extra_fields,
        preview_summary: data.preview_summary,
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/strategies/[id] - Update a strategy
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validationResult = UpdateStrategyRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Build update object (only include fields that are present)
    const updateData: any = {}
    if (validationResult.data.strategy_core) {
      updateData.strategy_core = validationResult.data.strategy_core
    }
    if (validationResult.data.style_tone) {
      updateData.style_tone = validationResult.data.style_tone
    }
    if (validationResult.data.cta_funnel) {
      updateData.cta_funnel = validationResult.data.cta_funnel
    }
    if (validationResult.data.extra_fields !== undefined) {
      updateData.extra_fields = validationResult.data.extra_fields
    }
    if (validationResult.data.preview_summary !== undefined) {
      updateData.preview_summary = validationResult.data.preview_summary
    }

    // Update strategy (updated_at will be set automatically by database trigger)
    const { data, error } = await db
      .from('message_strategies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Strategy not found' },
          { status: 404 }
        )
      }
      console.error('Error updating strategy:', error)
      return NextResponse.json(
        { error: 'Failed to update strategy', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/strategies/[id] - Delete a strategy
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    const { error } = await db
      .from('message_strategies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting strategy:', error)
      return NextResponse.json(
        { error: 'Failed to delete strategy', details: error.message },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
