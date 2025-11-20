import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']
type CampaignInsert = Database['campaign_os']['Tables']['campaigns']['Insert']
type CampaignUpdate = Database['campaign_os']['Tables']['campaigns']['Update']

// GET /api/campaigns - List all campaigns
export async function GET() {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { data, error } = await db
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
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

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body: CampaignInsert = await request.json()
    
    // Validation
    if (!body.name || !body.campaign_type || !body.start_date || !body.end_date || !body.primary_goal_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, campaign_type, start_date, end_date, primary_goal_type' },
        { status: 400 }
      )
    }

    // Date validation: end_date must be after start_date
    const startDate = new Date(body.start_date)
    const endDate = new Date(body.end_date)
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'end_date must be after start_date' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { data, error } = await db
      .from('campaigns')
      .insert({
        name: body.name,
        campaign_type: body.campaign_type,
        start_date: body.start_date,
        end_date: body.end_date,
        primary_goal_type: body.primary_goal_type,
        secondary_goals: body.secondary_goals || null,
        description: body.description || null,
        budget_estimate: body.budget_estimate || null,
        status: body.status || 'planning',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to create campaign', details: error.message },
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

