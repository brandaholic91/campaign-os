import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CampaignStructureSchema } from '@/lib/ai/schemas'
import { z } from 'zod'

const SaveStructureSchema = z.object({
  campaign: z.object({
    name: z.string(),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    campaignType: z.string(),
    goalType: z.string(),
  }),
  structure: CampaignStructureSchema
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign, structure } = SaveStructureSchema.parse(body)

    const supabase = await createClient()

    // 1. Create Campaign
    const { data: campaignData, error: campaignError } = await supabase
      .schema('campaign_os')
      .from('campaigns')
      .insert({
        name: campaign.name,
        description: campaign.description,
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        campaign_type: campaign.campaignType as any,
        primary_goal_type: campaign.goalType as any,
        status: 'planning',
        narratives: structure.narratives as any // Cast to any because column might not exist in types yet
      } as any)
      .select()
      .single()

    if (campaignError) throw new Error(`Campaign creation failed: ${campaignError.message}`)
    const campaignId = campaignData.id

    // 2. Create Goals
    if (structure.goals.length > 0) {
      const { error: goalsError } = await supabase
        .schema('campaign_os')
        .from('goals')
        .insert(
          structure.goals.map(g => ({
            campaign_id: campaignId,
            title: g.title,
            description: g.description,
            priority: g.priority || 1
          })) as any
        )
      if (goalsError) throw new Error(`Goals creation failed: ${goalsError.message}`)
    }

    // 3. Create Segments
    if (structure.segments.length > 0) {
      const { error: segmentsError } = await supabase
        .schema('campaign_os')
        .from('segments')
        .insert(
          structure.segments.map(s => ({
            campaign_id: campaignId,
            name: s.name,
            description: s.description,
            priority: s.priority || 1,
            demographics: s.demographics || {},
            psychographics: s.psychographics || {}
          })) as any
        )
      if (segmentsError) throw new Error(`Segments creation failed: ${segmentsError.message}`)
    }

    // 4. Create Topics
    if (structure.topics.length > 0) {
      const { error: topicsError } = await supabase
        .schema('campaign_os')
        .from('topics')
        .insert(
          structure.topics.map(t => ({
            campaign_id: campaignId,
            name: t.name,
            description: t.description,
            category: t.category
          })) as any
        )
      if (topicsError) throw new Error(`Topics creation failed: ${topicsError.message}`)
    }

    return NextResponse.json({ success: true, campaignId })

  } catch (error) {
    console.error('Save Structure Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
