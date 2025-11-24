import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/sprints - List sprints, optionally filtered by campaign_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    let query = db
      .from('sprints')
      .select('*')
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    
    const { data, error } = await query.order('start_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching sprints:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sprints' },
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const body = await request.json()

    // Validate dates
    if (new Date(body.end_date) < new Date(body.start_date)) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      )
    }

    // If ID is provided, check if it already exists
    let sprintId = body.id
    if (sprintId) {
      const { data: existingSprint } = await db
        .from('sprints')
        .select('id')
        .eq('id', sprintId)
        .single()

      if (existingSprint) {
        // Sprint already exists, return error suggesting to use PUT instead
        return NextResponse.json(
          { error: 'Sprint already exists. Use PUT to update instead.' },
          { status: 400 }
        )
      }
    }

    // Insert sprint with all fields
    const insertData: any = {
      campaign_id: body.campaign_id,
      name: body.name,
      start_date: body.start_date,
      end_date: body.end_date,
      focus_goal: body.focus_goal,
      focus_description: body.focus_description || '',
      focus_channels: body.focus_channels || [],
      order: body.order || 1,
      success_indicators: body.success_indicators || [],
      status: body.status || 'planned',
    }

    // If ID is provided (from SprintPlan) and doesn't exist, use it
    if (sprintId) {
      insertData.id = sprintId
    }

    const { data: newSprint, error } = await db
      .from('sprints')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Insert junction table relationships if provided
    if (body.focus_segments && Array.isArray(body.focus_segments) && body.focus_segments.length > 0) {
      const segmentInserts = body.focus_segments.map((segmentId: string) => ({
        sprint_id: newSprint.id,
        segment_id: segmentId,
      }))

      const { error: segmentsError } = await db
        .from('sprint_segments')
        .insert(segmentInserts)

      if (segmentsError) {
        console.error('Failed to insert sprint segments:', segmentsError)
        // Don't fail the whole request, but log the error
      }
    }

    if (body.focus_topics && Array.isArray(body.focus_topics) && body.focus_topics.length > 0) {
      const topicInserts = body.focus_topics.map((topicId: string) => ({
        sprint_id: newSprint.id,
        topic_id: topicId,
      }))

      const { error: topicsError } = await db
        .from('sprint_topics')
        .insert(topicInserts)

      if (topicsError) {
        console.error('Failed to insert sprint topics:', topicsError)
        // Don't fail the whole request, but log the error
      }
    }

    if (body.focus_channels && Array.isArray(body.focus_channels) && body.focus_channels.length > 0) {
      const channelInserts = body.focus_channels.map((channelKey: string) => ({
        sprint_id: newSprint.id,
        channel_key: channelKey,
      }))

      const { error: channelsError } = await db
        .from('sprint_channels')
        .insert(channelInserts)

      if (channelsError) {
        console.error('Failed to insert sprint channels:', channelsError)
        // Don't fail the whole request, but log the error
      }
    }

    return NextResponse.json(newSprint)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Sprint ID required' }, { status: 400 })
    }

    // Validate dates if both provided
    if (
      body.start_date &&
      body.end_date &&
      new Date(body.end_date) < new Date(body.start_date)
    ) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      )
    }

    const { data, error } = await db
      .from('sprints')
      .update({
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        focus_goal: body.focus_goal,
        focus_channels: body.focus_channels,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Sprint ID required' }, { status: 400 })
    }

    const { error } = await db.from('sprints').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
