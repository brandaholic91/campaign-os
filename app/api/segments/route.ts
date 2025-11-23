import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type SegmentInsert = Database['campaign_os']['Tables']['segments']['Insert']
type SegmentUpdate = Database['campaign_os']['Tables']['segments']['Update']

// GET /api/segments - List segments, optionally filtered by campaign_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    let query = db
      .from('segments')
      .select('*')
      .order('priority', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Error fetching segments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch segments' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/segments - Create a new segment
export async function POST(request: NextRequest) {
  try {
    const body: SegmentInsert = await request.json()
    
    // Validation
    if (!body.name || !body.campaign_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, campaign_id' },
        { status: 400 }
      )
    }

    // Validate JSONB fields if provided
    let demographics = body.demographics || null
    let psychographics = body.psychographics || null

    if (demographics !== null && typeof demographics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid demographics: must be a valid JSON object' },
        { status: 400 }
      )
    }

    if (psychographics !== null && typeof psychographics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid psychographics: must be a valid JSON object' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { data, error } = await db
      .from('segments')
      .insert({
        campaign_id: body.campaign_id,
        name: body.name,
        short_label: body.short_label,
        description: body.description || null,
        demographic_profile: body.demographic_profile || {},
        psychographic_profile: body.psychographic_profile || {},
        media_habits: body.media_habits || {},
        funnel_stage_focus: body.funnel_stage_focus,
        example_persona: body.example_persona || {},
        priority: body.priority || 'secondary',
        // Legacy fields
        demographics: body.demographics || body.demographic_profile || null,
        psychographics: body.psychographics || body.psychographic_profile || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating segment:', error)
      return NextResponse.json(
        { error: 'Failed to create segment', details: error.message },
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

// PUT /api/segments - Update a segment (requires id in body)
export async function PUT(request: NextRequest) {
  try {
    const body: SegmentUpdate & { id: string } = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Validate JSONB fields if provided
    const updateData: SegmentUpdate = { ...body }
    delete (updateData as any).id

    if (updateData.demographics !== undefined && updateData.demographics !== null && typeof updateData.demographics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid demographics: must be a valid JSON object' },
        { status: 400 }
      )
    }

    if (updateData.psychographics !== undefined && updateData.psychographics !== null && typeof updateData.psychographics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid psychographics: must be a valid JSON object' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { id } = body
    
    const { data, error } = await db
      .from('segments')
      .update({
        ...updateData,
        // Ensure legacy fields are synced if not explicitly provided but new ones are
        demographics: updateData.demographics || updateData.demographic_profile || undefined,
        psychographics: updateData.psychographics || updateData.psychographic_profile || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Segment not found' },
          { status: 404 }
        )
      }
      console.error('Error updating segment:', error)
      return NextResponse.json(
        { error: 'Failed to update segment', details: error.message },
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

// DELETE /api/segments - Delete a segment (requires id in query or body)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      // Try to get id from body
      const body = await request.json().catch(() => ({}))
      const bodyId = body.id
      
      if (!bodyId) {
        return NextResponse.json(
          { error: 'Missing required parameter: id' },
          { status: 400 }
        )
      }
      
      const supabase = await createClient()
      const db = supabase.schema('campaign_os')
      const { error } = await db
        .from('segments')
        .delete()
        .eq('id', bodyId)
      
      if (error) {
        console.error('Error deleting segment:', error)
        return NextResponse.json(
          { error: 'Failed to delete segment', details: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { error } = await db
      .from('segments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting segment:', error)
      return NextResponse.json(
        { error: 'Failed to delete segment', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

