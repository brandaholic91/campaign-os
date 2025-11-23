import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { z } from 'zod'

type MatrixInsert = Database['campaign_os']['Tables']['segment_topic_matrix']['Insert']

// Schema for validation
const MatrixEntrySchema = z.object({
  segment_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  importance: z.enum(['high', 'medium', 'low']),
  role: z.enum(['core_message', 'support', 'experimental']),
  summary: z.string().max(500).optional(),
})

// GET /api/segment-topic-matrix - List matrix entries for a campaign
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing required parameter: campaign_id' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    // Join with segments and topics to filter by campaign_id
    // Since matrix table doesn't have campaign_id directly, we filter by segments belonging to the campaign
    const { data, error } = await db
      .from('segment_topic_matrix')
      .select(`
        *,
        segment:segments!inner(id, campaign_id),
        topic:topics(id, name)
      `)
      .eq('segment.campaign_id', campaignId)
    
    if (error) {
      console.error('Error fetching matrix:', error)
      return NextResponse.json(
        { error: 'Failed to fetch matrix entries' },
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

// POST /api/segment-topic-matrix - Create or update matrix entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate body
    const validation = MatrixEntrySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const entry = validation.data
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { data, error } = await db
      .from('segment_topic_matrix')
      .upsert({
        segment_id: entry.segment_id,
        topic_id: entry.topic_id,
        importance: entry.importance,
        role: entry.role,
        summary: entry.summary,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving matrix entry:', error)
      return NextResponse.json(
        { error: 'Failed to save matrix entry', details: error.message },
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

// DELETE /api/segment-topic-matrix - Delete a matrix entry
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const segmentId = searchParams.get('segment_id')
    const topicId = searchParams.get('topic_id')
    
    if (!segmentId || !topicId) {
      return NextResponse.json(
        { error: 'Missing required parameters: segment_id, topic_id' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { error } = await db
      .from('segment_topic_matrix')
      .delete()
      .eq('segment_id', segmentId)
      .eq('topic_id', topicId)

    if (error) {
      console.error('Error deleting matrix entry:', error)
      return NextResponse.json(
        { error: 'Failed to delete matrix entry', details: error.message },
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
