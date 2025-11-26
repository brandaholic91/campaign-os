import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createSlotSchema = z.object({
  sprint_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  date: z.string(),
  channel: z.string(),
  slot_index: z.number().int().positive(),
  primary_segment_id: z.string().uuid().nullable().optional(),
  primary_topic_id: z.string().uuid().nullable().optional(),
  objective: z.enum(['reach', 'engagement', 'traffic', 'lead', 'conversion', 'mobilization']),
  content_type: z.enum(['short_video', 'story', 'static_image', 'carousel', 'live', 'long_post', 'email']),
  angle_hint: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().default('planned'),
  funnel_stage: z.string().optional(), // Optional, can be inferred or left null
  // Optional fields that might be required in DB but not in form
  angle_type: z.string().optional(),
  cta_type: z.string().optional(),
  time_of_day: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createSlotSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Érvénytelen adatok', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { data: validData } = validation

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Check for duplicate slot_index per (date, channel)
    const { data: existingSlots } = await db
      .from('content_slots')
      .select('id')
      .eq('date', validData.date)
      .eq('channel', validData.channel)
      .eq('slot_index', validData.slot_index)
      .single()

    if (existingSlots) {
      return NextResponse.json(
        { error: `Már létezik slot index ${validData.slot_index} erre a dátumra és csatornára` },
        { status: 409 }
      )
    }

    const { data: newSlot, error } = await db
      .from('content_slots')
      .insert({
        sprint_id: validData.sprint_id,
        campaign_id: validData.campaign_id,
        date: validData.date,
        channel: validData.channel,
        slot_index: validData.slot_index,
        primary_segment_id: validData.primary_segment_id || null,
        primary_topic_id: validData.primary_topic_id || null,
        objective: validData.objective,
        content_type: validData.content_type,
        angle_hint: validData.angle_hint || null,
        notes: validData.notes || null,
        status: validData.status,
        funnel_stage: validData.funnel_stage || 'awareness', // Default or derived
        // Provide defaults for required fields not in form
        angle_type: validData.angle_type || 'other',
        cta_type: validData.cta_type || 'soft_info',
        time_of_day: validData.time_of_day || 'unspecified',
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating content slot:', error)
      return NextResponse.json(
        { error: 'Hiba történt a slot létrehozása során' },
        { status: 500 }
      )
    }

    return NextResponse.json(newSlot)
  } catch (error) {
    console.error('Error in POST /api/content-slots:', error)
    return NextResponse.json(
      { error: 'Belső szerverhiba' },
      { status: 500 }
    )
  }
}
