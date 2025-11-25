import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentDraftSchema } from '@/lib/ai/schemas'

/**
 * GET /api/content-slots/[slotId]/drafts
 * Returns all content drafts for a given content slot, ordered by created_at DESC
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params

    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Verify slot exists
    const { data: slot, error: slotError } = await db
      .from('content_slots')
      .select('id')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Content slot not found' }, { status: 404 })
    }

    // Query drafts for this slot, ordered by created_at DESC (newest first)
    const { data: drafts, error: draftsError } = await db
      .from('content_drafts')
      .select('*')
      .eq('slot_id', slotId)
      .order('created_at', { ascending: false })

    if (draftsError) {
      console.error('Error fetching drafts:', draftsError)
      return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
    }

    return NextResponse.json({ drafts: drafts || [] })
  } catch (error) {
    console.error('GET /api/content-slots/[slotId]/drafts error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/content-slots/[slotId]/drafts
 * Creates a new content draft for a given content slot
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params

    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required' }, { status: 400 })
    }

    const body = await req.json()

    // Validate request body against ContentDraftSchema
    const validation = ContentDraftSchema.safeParse({
      ...body,
      slot_id: slotId,
      status: body.status || 'draft',
      created_by: body.created_by || 'human',
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Verify slot exists (foreign key check)
    const { data: slot, error: slotError } = await db
      .from('content_slots')
      .select('id')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Content slot not found' }, { status: 404 })
    }

    // Insert draft into content_drafts table
    const { data: draft, error: insertError } = await db
      .from('content_drafts')
      .insert([
        {
          slot_id: slotId,
          variant_name: validation.data.variant_name,
          status: validation.data.status,
          hook: validation.data.hook,
          body: validation.data.body,
          cta_copy: validation.data.cta_copy,
          visual_idea: validation.data.visual_idea,
          alt_text_suggestion: validation.data.alt_text_suggestion,
          length_hint: validation.data.length_hint,
          tone_notes: validation.data.tone_notes,
          used_segment_id: validation.data.used_segment_id,
          used_topic_id: validation.data.used_topic_id,
          used_goal_ids: validation.data.used_goal_ids,
          created_by: validation.data.created_by,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating draft:', insertError)
      return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 })
    }

    return NextResponse.json({ draft }, { status: 201 })
  } catch (error) {
    console.error('POST /api/content-slots/[slotId]/drafts error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
