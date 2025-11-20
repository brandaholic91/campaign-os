import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type TopicInsert = Database['campaign_os']['Tables']['topics']['Insert']
type TopicUpdate = Database['campaign_os']['Tables']['topics']['Update']

// GET /api/topics - List topics, optionally filtered by campaign_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    let query = db
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch topics' },
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

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const body: TopicInsert = await request.json()
    
    // Validation
    if (!body.name || !body.campaign_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, campaign_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { data, error } = await db
      .from('topics')
      .insert({
        campaign_id: body.campaign_id,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating topic:', error)
      return NextResponse.json(
        { error: 'Failed to create topic', details: error.message },
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

// PUT /api/topics - Update a topic (requires id in body)
export async function PUT(request: NextRequest) {
  try {
    const body: TopicUpdate & { id: string } = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { id, ...updateData } = body
    
    const { data, error } = await db
      .from('topics')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        )
      }
      console.error('Error updating topic:', error)
      return NextResponse.json(
        { error: 'Failed to update topic', details: error.message },
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

// DELETE /api/topics - Delete a topic (requires id in query or body)
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
        .from('topics')
        .delete()
        .eq('id', bodyId)
      
      if (error) {
        console.error('Error deleting topic:', error)
        return NextResponse.json(
          { error: 'Failed to delete topic', details: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { error } = await db
      .from('topics')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting topic:', error)
      return NextResponse.json(
        { error: 'Failed to delete topic', details: error.message },
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

