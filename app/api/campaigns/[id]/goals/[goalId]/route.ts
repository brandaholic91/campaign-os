import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoalSchema } from '@/lib/ai/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  try {
    const { id, goalId } = await params
    const body = await request.json()

    // Validate input
    const validationResult = GoalSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid goal data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const goalData = validationResult.data

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Update goal
    const { data, error } = await db
      .from('goals')
      .update({
        title: goalData.title,
        description: goalData.description,
        priority: goalData.priority,
        funnel_stage: goalData.funnel_stage,
        kpi_hint: goalData.kpi_hint,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('campaign_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Goal Update API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
