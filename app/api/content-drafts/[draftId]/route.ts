import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentDraftSchema } from '@/lib/ai/schemas'

/**
 * GET /api/content-drafts/[draftId]
 * Returns a single content draft by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params

    if (!draftId) {
      return NextResponse.json({ error: 'draftId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Query draft by id
    const { data: draft, error: draftError } = await db
      .from('content_drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (draftError) {
      // Check if it's a "not found" error (PGRST116)
      if (draftError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
      }
      console.error('Error fetching draft:', draftError)
      return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 })
    }

    if (!draft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('GET /api/content-drafts/[draftId] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * PUT /api/content-drafts/[draftId]
 * Updates an existing content draft
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params

    if (!draftId) {
      return NextResponse.json({ error: 'draftId is required' }, { status: 400 })
    }

    const body = await req.json()

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Fetch existing draft to merge with updates
    const { data: existingDraft, error: fetchError } = await db
      .from('content_drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
      }
      console.error('Error fetching draft for update:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 })
    }

    if (!existingDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Merge existing draft with updates
    const updatedData = {
      ...existingDraft,
      ...body,
      id: existingDraft.id, // Prevent id from being changed
      slot_id: existingDraft.slot_id, // Prevent slot_id from being changed
      created_at: existingDraft.created_at, // Prevent created_at from being changed
    }

    // If only updating status (e.g., approval), skip full validation
    const isStatusOnlyUpdate = Object.keys(body).length === 1 && 'status' in body
    
    if (!isStatusOnlyUpdate) {
      // Validate merged data against ContentDraftSchema for full updates
      const validation = ContentDraftSchema.safeParse(updatedData)

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.issues },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    }

    // Add fields from body
    if (body.variant_name !== undefined) updatePayload.variant_name = body.variant_name
    if (body.status !== undefined) updatePayload.status = body.status
    if (body.hook !== undefined) updatePayload.hook = body.hook
    if (body.body !== undefined) updatePayload.body = body.body
    if (body.cta_copy !== undefined) updatePayload.cta_copy = body.cta_copy
    if (body.visual_idea !== undefined) updatePayload.visual_idea = body.visual_idea
    if (body.alt_text_suggestion !== undefined) updatePayload.alt_text_suggestion = body.alt_text_suggestion
    if (body.length_hint !== undefined) updatePayload.length_hint = body.length_hint
    if (body.tone_notes !== undefined) updatePayload.tone_notes = body.tone_notes
    if (body.used_segment_id !== undefined) updatePayload.used_segment_id = body.used_segment_id
    if (body.used_topic_id !== undefined) updatePayload.used_topic_id = body.used_topic_id
    if (body.used_goal_ids !== undefined) updatePayload.used_goal_ids = body.used_goal_ids
    if (body.created_by !== undefined) updatePayload.created_by = body.created_by

    // Update draft in database
    const { data: draft, error: updateError } = await db
      .from('content_drafts')
      .update(updatePayload)
      .eq('id', draftId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating draft:', updateError)
      return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('PUT /api/content-drafts/[draftId] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * DELETE /api/content-drafts/[draftId]
 * Deletes a content draft
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params

    if (!draftId) {
      return NextResponse.json({ error: 'draftId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Verify draft exists before deletion
    const { data: existingDraft, error: fetchError } = await db
      .from('content_drafts')
      .select('id')
      .eq('id', draftId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
      }
      console.error('Error checking draft existence:', fetchError)
      return NextResponse.json({ error: 'Failed to verify draft' }, { status: 500 })
    }

    if (!existingDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Delete draft
    const { error: deleteError } = await db
      .from('content_drafts')
      .delete()
      .eq('id', draftId)

    if (deleteError) {
      console.error('Error deleting draft:', deleteError)
      return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/content-drafts/[draftId] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
