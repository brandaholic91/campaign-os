import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types'

type SprintUpdate = Database['campaign_os']['Tables']['sprints']['Update']
type SprintSegmentInsert = Database['campaign_os']['Tables']['sprint_segments']['Insert']
type SprintTopicInsert = Database['campaign_os']['Tables']['sprint_topics']['Insert']
type SprintChannelInsert = Database['campaign_os']['Tables']['sprint_channels']['Insert']

interface UpdateSprintRequest {
  name?: string
  start_date?: string
  end_date?: string
  focus_goal?: string
  focus_description?: string
  focus_segments?: string[]
  focus_topics?: string[]
  focus_channels?: string[]
  success_indicators?: any[]
  status?: string
}

// PUT /api/sprints/[id] - Update a sprint
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateSprintRequest = await request.json()

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Validate dates if both provided
    if (body.start_date && body.end_date) {
      if (new Date(body.end_date) < new Date(body.start_date)) {
        return NextResponse.json(
          { error: 'A befejezési dátumnak a kezdési dátum után kell lennie' },
          { status: 400 }
        )
      }
    }

    // Update sprint main fields
    const updateData: SprintUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.start_date !== undefined) updateData.start_date = body.start_date
    if (body.end_date !== undefined) updateData.end_date = body.end_date
    if (body.focus_goal !== undefined) updateData.focus_goal = body.focus_goal
    if (body.focus_description !== undefined)
      updateData.focus_description = body.focus_description
    if (body.focus_channels !== undefined)
      updateData.focus_channels = body.focus_channels as any
    if (body.success_indicators !== undefined)
      updateData.success_indicators = body.success_indicators as any
    if (body.status !== undefined) updateData.status = body.status as any

    const { data: updatedSprint, error: updateError } = await db
      .from('sprints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Update junction tables if provided
    if (body.focus_segments !== undefined) {
      // Delete existing relationships
      await db.from('sprint_segments').delete().eq('sprint_id', id)

      // Insert new relationships
      if (body.focus_segments.length > 0) {
        const segmentInserts: SprintSegmentInsert[] = body.focus_segments.map(
          (segmentId) => ({
            sprint_id: id,
            segment_id: segmentId,
          })
        )

        const { error: segmentsError } = await db
          .from('sprint_segments')
          .insert(segmentInserts)

        if (segmentsError) {
          return NextResponse.json(
            { error: `Failed to update sprint segments: ${segmentsError.message}` },
            { status: 500 }
          )
        }
      }
    }

    if (body.focus_topics !== undefined) {
      // Delete existing relationships
      await db.from('sprint_topics').delete().eq('sprint_id', id)

      // Insert new relationships
      if (body.focus_topics.length > 0) {
        const topicInserts: SprintTopicInsert[] = body.focus_topics.map(
          (topicId) => ({
            sprint_id: id,
            topic_id: topicId,
          })
        )

        const { error: topicsError } = await db
          .from('sprint_topics')
          .insert(topicInserts)

        if (topicsError) {
          return NextResponse.json(
            { error: `Failed to update sprint topics: ${topicsError.message}` },
            { status: 500 }
          )
        }
      }
    }

    if (body.focus_channels !== undefined) {
      // Delete existing relationships
      await db.from('sprint_channels').delete().eq('sprint_id', id)

      // Insert new relationships
      if (body.focus_channels.length > 0) {
        const channelInserts: SprintChannelInsert[] = body.focus_channels.map(
          (channelKey) => ({
            sprint_id: id,
            channel_key: channelKey,
          })
        )

        const { error: channelsError } = await db
          .from('sprint_channels')
          .insert(channelInserts)

        if (channelsError) {
          return NextResponse.json(
            { error: `Failed to update sprint channels: ${channelsError.message}` },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(updatedSprint)
  } catch (error) {
    console.error('Error updating sprint:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/sprints/[id] - Delete a sprint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // CASCADE delete will handle related content_slots and junction tables
    const { error } = await db.from('sprints').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sprint:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

