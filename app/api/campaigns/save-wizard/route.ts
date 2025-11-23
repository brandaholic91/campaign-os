import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SaveWizardSchema = z.object({
  campaign: z.object({
    name: z.string(),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    campaignType: z.string(),
    goalType: z.string(),
    budgetEstimate: z.number().optional(),
  }),
  wizardData: z.any(), // All form data from the wizard - using z.any() instead of z.record() to avoid validation issues
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate only campaign data, wizardData can be any structure
    const campaignSchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      campaignType: z.string(),
      goalType: z.string(),
      budgetEstimate: z.number().optional(),
    })

    if (!body.campaign || !body.wizardData) {
      return NextResponse.json(
        { error: 'Missing required fields: campaign and wizardData' },
        { status: 400 }
      )
    }

    const campaignValidation = campaignSchema.safeParse(body.campaign)
    if (!campaignValidation.success) {
      console.error('Campaign validation error:', campaignValidation.error)
      return NextResponse.json(
        { 
          error: 'Invalid campaign data',
          details: campaignValidation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    const campaign = campaignValidation.data
    const wizardData = body.wizardData // Accept any structure for wizardData

    const supabase = await createClient()

    // Create Campaign with wizard_data, but don't generate structure
    const { data: campaignData, error: campaignError } = await supabase
      .schema('campaign_os')
      .from('campaigns')
      .insert({
        name: campaign.name,
        description: campaign.description || null,
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        campaign_type: campaign.campaignType as any,
        primary_goal_type: campaign.goalType as any,
        status: 'planning',
        budget_estimate: campaign.budgetEstimate || null,
        wizard_data: wizardData as any,
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Supabase error:', campaignError)
      return NextResponse.json(
        { error: `Campaign creation failed: ${campaignError.message}` },
        { status: 500 }
      )
    }

    if (!campaignData) {
      return NextResponse.json(
        { error: 'Campaign creation failed: No data returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      campaignId: campaignData.id, 
      campaign: campaignData 
    })
  } catch (error) {
    console.error('Save Wizard Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

