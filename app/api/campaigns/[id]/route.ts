import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type CampaignUpdate = Database['campaign_os']['Tables']['campaigns']['Update']

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { data, error } = await db
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching campaign:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
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

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: CampaignUpdate = await request.json()
    
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    // If dates are being updated, validate them
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date)
      const endDate = new Date(body.end_date)
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'end_date must be after start_date' },
          { status: 400 }
        )
      }
    } else if (body.start_date || body.end_date) {
      // If only one date is being updated, fetch current campaign to validate
      const { data: currentCampaign } = await db
        .from('campaigns')
        .select('start_date, end_date')
        .eq('id', id)
        .single()
      
      if (currentCampaign) {
        const startDate = new Date(body.start_date || currentCampaign.start_date)
        const endDate = new Date(body.end_date || currentCampaign.end_date)
        if (endDate <= startDate) {
          return NextResponse.json(
            { error: 'end_date must be after start_date' },
            { status: 400 }
          )
        }
      }
    }
    
    const { data, error } = await db
      .from('campaigns')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }
      console.error('Error updating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to update campaign', details: error.message },
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

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    
    const { error } = await db
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return NextResponse.json(
        { error: 'Failed to delete campaign', details: error.message },
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

