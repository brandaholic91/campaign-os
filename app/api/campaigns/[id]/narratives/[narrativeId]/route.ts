import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NarrativeSchema } from '@/lib/ai/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; narrativeId: string }> }
) {
  try {
    const { id, narrativeId } = await params
    const body = await request.json()

    // Validate input
    // Note: NarrativeSchema might include fields we don't want to force update here or might need partial validation
    // But for editing, we usually send the full object.
    const validationResult = NarrativeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid narrative data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const narrativeData = validationResult.data

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Update narrative
    const { data, error } = await db
      .from('narratives')
      .update({
        title: narrativeData.title,
        description: narrativeData.description,
        priority: narrativeData.priority,
        suggested_phase: narrativeData.suggested_phase,
        updated_at: new Date().toISOString(),
      })
      .eq('id', narrativeId)
      .eq('campaign_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating narrative:', error)
      return NextResponse.json(
        { error: 'Failed to update narrative' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Narrative Update API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
