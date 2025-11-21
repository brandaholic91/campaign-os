import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/messages - List messages, optionally filtered by campaign_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    let query = db
      .from('messages')
      .select('*')
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
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

    const { data, error } = await db
      .from('messages')
      .insert({
        campaign_id: body.campaign_id,
        segment_id: body.segment_id,
        topic_id: body.topic_id,
        message_type: body.message_type,
        headline: body.headline,
        body: body.body,
        proof_point: body.proof_point,
        cta: body.cta,
        status: 'draft', // Default status
      })
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

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const { data, error } = await db
      .from('messages')
      .update({
        message_type: body.message_type,
        headline: body.headline,
        body: body.body,
        proof_point: body.proof_point,
        cta: body.cta,
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
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const { error } = await db.from('messages').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
