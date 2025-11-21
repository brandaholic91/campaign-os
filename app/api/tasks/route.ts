import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/tasks - List tasks, optionally filtered by campaign_id or sprint_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    const sprintId = searchParams.get('sprint_id')
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    let query = db
      .from('tasks')
      .select('*')
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    
    if (sprintId) {
      query = query.eq('sprint_id', sprintId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
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
      .from('tasks')
      .insert({
        campaign_id: body.campaign_id,
        sprint_id: body.sprint_id,
        title: body.title,
        description: body.description,
        category: body.category,
        channel_id: body.channel_id,
        due_date: body.due_date,
        status: 'todo', // Default status
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
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const { data, error } = await db
      .from('tasks')
      .update({
        title: body.title,
        description: body.description,
        category: body.category,
        channel_id: body.channel_id,
        due_date: body.due_date,
        status: body.status,
        assignee: body.assignee,
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
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const { error } = await db.from('tasks').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
