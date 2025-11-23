import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CampaignStructureSchema } from '@/lib/ai/schemas'
import { z } from 'zod'

const SaveStructureSchema = z.object({
  campaignId: z.string().optional(), // Optional: if provided, update existing campaign
  campaign: z.object({
    name: z.string(),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    campaignType: z.string(),
    goalType: z.string(),
  }),
  structure: CampaignStructureSchema,
  wizardData: z.any().optional(), // Wizard form data to save
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaignId: existingCampaignId, campaign, structure, wizardData } = SaveStructureSchema.parse(body)

    const supabase = await createClient()

    let campaignId: string

    if (existingCampaignId) {
      // Update existing campaign
      const { data: campaignData, error: campaignError } = await supabase
        .schema('campaign_os')
        .from('campaigns')
        .update({
          name: campaign.name,
          description: campaign.description,
          start_date: campaign.startDate,
          end_date: campaign.endDate,
          campaign_type: campaign.campaignType as any,
          primary_goal_type: campaign.goalType as any,
          narratives: structure.narratives || [],
          wizard_data: wizardData || null
        })
        .eq('id', existingCampaignId)
        .select()
        .single()

      if (campaignError) throw new Error(`Campaign update failed: ${campaignError.message}`)
      if (!campaignData) throw new Error('Campaign not found')
      campaignId = campaignData.id

      // Delete existing related data
      // First get segment IDs before deleting
      const { data: existingSegments } = await supabase
        .schema('campaign_os')
        .from('segments')
        .select('id')
        .eq('campaign_id', campaignId)
      
      const segmentIds = existingSegments?.map(s => s.id) || []
      
      // Delete matrix entries first (they reference segments)
      if (segmentIds.length > 0) {
        await supabase
          .schema('campaign_os')
          .from('segment_topic_matrix')
          .delete()
          .in('segment_id', segmentIds)
      }
      
      // Then delete the related entities
      await supabase.schema('campaign_os').from('goals').delete().eq('campaign_id', campaignId)
      await supabase.schema('campaign_os').from('segments').delete().eq('campaign_id', campaignId)
      await supabase.schema('campaign_os').from('topics').delete().eq('campaign_id', campaignId)
    } else {
      // Create new campaign
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
          narratives: structure.narratives || [],
          wizard_data: wizardData || null
        })
        .select()
        .single()

      if (campaignError) throw new Error(`Campaign creation failed: ${campaignError.message}`)
      campaignId = campaignData.id
    }

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
    let segmentIdMap = new Map<number, string>() // Map index in array to DB UUID
    if (structure.segments.length > 0) {
      const { data: createdSegments, error: segmentsError } = await supabase
        .schema('campaign_os')
        .from('segments')
        .insert(
          structure.segments.map(s => ({
            campaign_id: campaignId,
            name: s.name,
            short_label: s.short_label,
            description: s.description,
            priority: s.priority || 'secondary',
            demographic_profile: s.demographic_profile || {},
            psychographic_profile: s.psychographic_profile || {},
            media_habits: s.media_habits || {},
            funnel_stage_focus: s.funnel_stage_focus,
            example_persona: s.example_persona || {},
            // Legacy fields fallback
            demographics: s.demographics || s.demographic_profile || {},
            psychographics: s.psychographics || s.psychographic_profile || {}
          })) as any
        )
        .select('id')
      
      if (segmentsError) throw new Error(`Segments creation failed: ${segmentsError.message}`)
      
      // Store IDs for matrix creation
      if (createdSegments) {
        createdSegments.forEach((seg, index) => {
          segmentIdMap.set(index, seg.id)
        })
      }
    }

    // 4. Create Topics
    let topicIdMap = new Map<number, string>() // Map index in array to DB UUID
    if (structure.topics.length > 0) {
      const { data: createdTopics, error: topicsError } = await supabase
        .schema('campaign_os')
        .from('topics')
        .insert(
          structure.topics.map(t => ({
            campaign_id: campaignId,
            name: t.name,
            short_label: t.short_label,
            description: t.description,
            topic_type: t.topic_type,
            related_goal_types: t.related_goal_types || [],
            core_narrative: t.core_narrative,
            content_angles: t.content_angles || [],
            recommended_channels: t.recommended_channels || [],
            risk_notes: t.risk_notes || [],
            priority: t.priority || 'secondary',
            category: t.category // Legacy
          })) as any
        )
        .select('id')

      if (topicsError) throw new Error(`Topics creation failed: ${topicsError.message}`)

      // Store IDs for matrix creation
      if (createdTopics) {
        createdTopics.forEach((topic, index) => {
          topicIdMap.set(index, topic.id)
        })
      }
    }

    // 5. Create Segment-Topic Matrix
    console.log('Matrix generation check:', {
      hasMatrix: !!structure.segment_topic_matrix,
      matrixLength: structure.segment_topic_matrix?.length || 0,
      segmentCount: segmentIdMap.size,
      topicCount: topicIdMap.size
    })

    if (structure.segment_topic_matrix && structure.segment_topic_matrix.length > 0) {
      console.log('Raw matrix entries:', JSON.stringify(structure.segment_topic_matrix, null, 2))
      
      // Filter valid matrix entries where both segment and topic exist
      const validMatrixEntries = structure.segment_topic_matrix
        .filter((entry: any) => {
          const hasSegment = segmentIdMap.has(entry.segment_index)
          const hasTopic = topicIdMap.has(entry.topic_index)
          
          if (!hasSegment || !hasTopic) {
            console.warn('Invalid matrix entry filtered out:', {
              entry,
              hasSegment,
              hasTopic,
              segmentIndex: entry.segment_index,
              topicIndex: entry.topic_index,
              availableSegmentIndices: Array.from(segmentIdMap.keys()),
              availableTopicIndices: Array.from(topicIdMap.keys())
            })
          }
          
          return hasSegment && hasTopic
        })
        .map((entry: any) => ({
          segment_id: segmentIdMap.get(entry.segment_index)!, // Non-null assertion safe due to filter
          topic_id: topicIdMap.get(entry.topic_index)!, // Non-null assertion safe due to filter
          importance: entry.importance,
          role: entry.role,
          summary: entry.summary || null
        }))

      console.log('Valid matrix entries to insert:', validMatrixEntries.length)

      if (validMatrixEntries.length > 0) {
        const { data: insertedData, error: matrixError } = await supabase
          .schema('campaign_os')
          .from('segment_topic_matrix')
          .insert(validMatrixEntries)
          .select()
        
        if (matrixError) {
          console.error('Matrix creation failed:', matrixError)
          console.error('Failed entries:', validMatrixEntries)
          // Log the error but don't fail the entire operation
          // The campaign structure is saved, but matrix entries are not
          // This allows the user to manually add matrix entries later if needed
          console.warn('Segment-topic matrix entries could not be saved. Campaign structure saved successfully, but matrix entries need to be added manually or permissions need to be fixed.')
        } else {
          console.log('Matrix entries successfully inserted:', insertedData?.length || 0)
        }
      } else {
        console.warn('No valid matrix entries to insert after filtering')
      }
    } else {
      console.warn('No segment_topic_matrix provided in structure or matrix is empty')
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
