import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/sprints - List sprints, optionally filtered by campaign_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
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

    // Validate dates
    if (new Date(body.end_date) < new Date(body.start_date)) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      )
    }

    const { data, error } = await db
      .from('sprints')
      .insert({
        campaign_id: body.campaign_id,
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        focus_goal: body.focus_goal,
        focus_channels: body.focus_channels || [],
        status: 'planned', // Default status
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

    const { data, error } = await db
      .from('sprints')
      .update({
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        focus_goal: body.focus_goal,
        focus_channels: body.focus_channels,
        status: body.status,
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
