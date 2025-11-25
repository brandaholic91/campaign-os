import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/sprints - List sprints, optionally filtered by campaign_id
// If a sprint ID is provided, fetch with all related data (segments, topics, channels)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    const sprintId = searchParams.get('id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    // If sprint ID is provided, fetch single sprint with related data
    if (sprintId) {
      const { data: sprint, error: sprintError } = await db
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single()
      
      if (sprintError || !sprint) {
        return NextResponse.json(
          { error: 'Sprint not found' },
          { status: 404 }
        )
      }
      
      // Fetch related segments
      const { data: sprintSegments } = await db
        .from('sprint_segments')
        .select('segment_id')
        .eq('sprint_id', sprintId)
      
      // Fetch related topics
      const { data: sprintTopics } = await db
        .from('sprint_topics')
        .select('topic_id')
        .eq('sprint_id', sprintId)
      
      // Fetch related channels
      const { data: sprintChannels } = await db
        .from('sprint_channels')
        .select('channel_key')
        .eq('sprint_id', sprintId)
      
      return NextResponse.json({
        ...sprint,
        focus_segments: (sprintSegments || []).map(s => s.segment_id),
        focus_topics: (sprintTopics || []).map(t => t.topic_id),
        focus_channels: (sprintChannels || []).map(c => c.channel_key),
      })
    }
    
    // Otherwise, fetch all sprints for campaign
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
    
    // For each sprint, fetch related data
    const sprintsWithRelations = await Promise.all((data || []).map(async (sprint: any) => {
      // Fetch related segments
      const { data: sprintSegments } = await db
        .from('sprint_segments')
        .select('segment_id')
        .eq('sprint_id', sprint.id)
      
      // Fetch related topics
      const { data: sprintTopics } = await db
        .from('sprint_topics')
        .select('topic_id')
        .eq('sprint_id', sprint.id)
      
      // Fetch related channels
      const { data: sprintChannels } = await db
        .from('sprint_channels')
        .select('channel_key')
        .eq('sprint_id', sprint.id)
      
      return {
        ...sprint,
        focus_segments: (sprintSegments || []).map((s: any) => s.segment_id),
        focus_topics: (sprintTopics || []).map((t: any) => t.topic_id),
        focus_channels: (sprintChannels || []).map((c: any) => c.channel_key),
      }
    }))
    
    return NextResponse.json(sprintsWithRelations)
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
      risks_and_watchouts: body.risks_and_watchouts || [],
      success_criteria: body.success_criteria || [],
      key_messages_summary: body.key_messages_summary || null,
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

    // Update sprint with all fields
    const updateData: any = {
      name: body.name,
      start_date: body.start_date,
      end_date: body.end_date,
      focus_goal: body.focus_goal,
      focus_description: body.focus_description !== undefined ? body.focus_description : null,
      focus_channels: body.focus_channels || [],
      order: body.order !== undefined ? body.order : null,
      success_indicators: body.success_indicators || [],
      risks_and_watchouts: body.risks_and_watchouts !== undefined ? body.risks_and_watchouts : null,
      success_criteria: body.success_criteria !== undefined ? body.success_criteria : null,
      key_messages_summary: body.key_messages_summary !== undefined ? body.key_messages_summary : null,
      status: body.status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await db
      .from('sprints')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update junction table relationships if provided
    // First, delete existing relationships
    await db.from('sprint_segments').delete().eq('sprint_id', body.id)
    await db.from('sprint_topics').delete().eq('sprint_id', body.id)
    await db.from('sprint_channels').delete().eq('sprint_id', body.id)

    // Then insert new relationships
    if (body.focus_segments && Array.isArray(body.focus_segments) && body.focus_segments.length > 0) {
      const segmentInserts = body.focus_segments.map((segmentId: string) => ({
        sprint_id: body.id,
        segment_id: segmentId,
      }))

      const { error: segmentsError } = await db
        .from('sprint_segments')
        .insert(segmentInserts)

      if (segmentsError) {
        console.error('Failed to update sprint segments:', segmentsError)
      }
    }

    if (body.focus_topics && Array.isArray(body.focus_topics) && body.focus_topics.length > 0) {
      const topicInserts = body.focus_topics.map((topicId: string) => ({
        sprint_id: body.id,
        topic_id: topicId,
      }))

      const { error: topicsError } = await db
        .from('sprint_topics')
        .insert(topicInserts)

      if (topicsError) {
        console.error('Failed to update sprint topics:', topicsError)
      }
    }

    if (body.focus_channels && Array.isArray(body.focus_channels) && body.focus_channels.length > 0) {
      const channelInserts = body.focus_channels.map((channelKey: string) => ({
        sprint_id: body.id,
        channel_key: channelKey,
      }))

      const { error: channelsError } = await db
        .from('sprint_channels')
        .insert(channelInserts)

      if (channelsError) {
        console.error('Failed to update sprint channels:', channelsError)
      }
    }

    // Return updated sprint with relations
    const { data: sprintSegments } = await db
      .from('sprint_segments')
      .select('segment_id')
      .eq('sprint_id', body.id)

    const { data: sprintTopics } = await db
      .from('sprint_topics')
      .select('topic_id')
      .eq('sprint_id', body.id)

    const { data: sprintChannels } = await db
      .from('sprint_channels')
      .select('channel_key')
      .eq('sprint_id', body.id)

    return NextResponse.json({
      ...data,
      focus_segments: (sprintSegments || []).map((s: any) => s.segment_id),
      focus_topics: (sprintTopics || []).map((t: any) => t.topic_id),
      focus_channels: (sprintChannels || []).map((c: any) => c.channel_key),
    })
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
