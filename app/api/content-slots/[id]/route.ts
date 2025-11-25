import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types'

type ContentSlotUpdate = Database['campaign_os']['Tables']['content_slots']['Update']

interface UpdateContentSlotRequest {
  date?: string
  channel?: string
  slot_index?: number
  primary_segment_id?: string | null
  primary_topic_id?: string | null
  objective?: string
  content_type?: string
  angle_hint?: string | null
  notes?: string | null
  status?: string
}

// PUT /api/content-slots/[id] - Update a content slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateContentSlotRequest = await request.json()

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Get existing slot to validate sprint date range
    const { data: existingSlot, error: fetchError } = await db
      .from('content_slots')
      .select('sprint_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingSlot) {
      return NextResponse.json(
        { error: 'Content slot not found' },
        { status: 404 }
      )
    }

    // If date is being updated, validate it's within sprint range
    if (body.date) {
      const { data: sprint } = await db
        .from('sprints')
        .select('start_date, end_date')
        .eq('id', existingSlot.sprint_id)
        .single()

      if (sprint) {
        const slotDate = new Date(body.date)
        const sprintStart = new Date(sprint.start_date)
        const sprintEnd = new Date(sprint.end_date)

        if (slotDate < sprintStart || slotDate > sprintEnd) {
          return NextResponse.json(
            {
              error: `A dátumnak a sprint dátumtartományán belül kell lennie (${sprint.start_date} - ${sprint.end_date})`,
            },
            { status: 400 }
          )
        }
      }
    }

    // If date, channel, or slot_index is being updated, check for duplicates
    if (body.date || body.channel || body.slot_index !== undefined) {
      const dateToCheck = body.date || (await db
        .from('content_slots')
        .select('date')
        .eq('id', id)
        .single()).data?.date

      const channelToCheck = body.channel || (await db
        .from('content_slots')
        .select('channel')
        .eq('id', id)
        .single()).data?.channel

      const slotIndexToCheck = body.slot_index !== undefined
        ? body.slot_index
        : (await db
            .from('content_slots')
            .select('slot_index')
            .eq('id', id)
            .single()).data?.slot_index

      if (dateToCheck && channelToCheck && slotIndexToCheck !== undefined) {
        const { data: duplicates } = await db
          .from('content_slots')
          .select('id')
          .eq('date', dateToCheck)
          .eq('channel', channelToCheck)
          .eq('slot_index', slotIndexToCheck)
          .neq('id', id)

        if (duplicates && duplicates.length > 0) {
          return NextResponse.json(
            {
              error: `Már létezik slot index ${slotIndexToCheck} erre a dátumra és csatornára`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Update content slot
    const updateData: ContentSlotUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (body.date !== undefined) updateData.date = body.date
    if (body.channel !== undefined) updateData.channel = body.channel
    if (body.slot_index !== undefined) updateData.slot_index = body.slot_index
    if (body.primary_segment_id !== undefined)
      updateData.primary_segment_id = body.primary_segment_id ?? undefined
    if (body.primary_topic_id !== undefined)
      updateData.primary_topic_id = body.primary_topic_id ?? undefined
    if (body.objective !== undefined) updateData.objective = body.objective
    if (body.content_type !== undefined)
      updateData.content_type = body.content_type
    if (body.angle_hint !== undefined) updateData.angle_hint = body.angle_hint
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.status !== undefined) updateData.status = body.status as any

    const { data: updatedSlot, error: updateError } = await db
      .from('content_slots')
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

    return NextResponse.json(updatedSlot)
  } catch (error) {
    console.error('Error updating content slot:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/content-slots/[id] - Delete a content slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    const { error } = await db.from('content_slots').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content slot:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

