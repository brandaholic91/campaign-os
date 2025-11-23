import { createClient } from '@/lib/supabase/server'
import { CampaignStructure } from '@/lib/validation/campaign-structure'

export async function fetchCampaignStructure(id: string): Promise<CampaignStructure | null> {
  const supabase = await createClient()
  const db = supabase.schema('campaign_os')

  // 1. Fetch Campaign
  const { data: campaign, error: campaignError } = await db
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return null
  }

  // 2. Fetch Components
  const { data: goals } = await db.from('goals').select('*').eq('campaign_id', id)
  const { data: segments } = await db.from('segments').select('*').eq('campaign_id', id)
  const { data: topics } = await db.from('topics').select('*').eq('campaign_id', id)
  
  // Fetch narratives with relations
  const { data: narrativesData } = await db
    .from('narratives')
    .select(`
      *,
      narrative_goals (goal_id),
      narrative_topics (topic_id)
    `)
    .eq('campaign_id', id)

  // Fetch Matrix
  let matrix: any[] = []
  if (segments && segments.length > 0) {
    const segmentIds = segments.map(s => s.id)
    const { data: matrixData } = await db
      .from('segment_topic_matrix')
      .select('*')
      .in('segment_id', segmentIds)
    
    if (matrixData) matrix = matrixData
  }

  // 3. Construct CampaignStructure
  const structure: CampaignStructure = {
    goals: (goals || []).map(g => ({
      ...g,
      priority: g.priority || 1,
      target_metric: g.target_metric as any,
      funnel_stage: g.funnel_stage as any
    })),
    segments: (segments || []).map(s => ({
      ...s,
      priority: s.priority as any,
      demographic_profile: s.demographic_profile as any,
      psychographic_profile: s.psychographic_profile as any,
      media_habits: s.media_habits as any,
      example_persona: s.example_persona as any,
      funnel_stage_focus: s.funnel_stage_focus as any
    })),
    topics: (topics || []).map(t => ({
      ...t,
      priority: t.priority as any,
      topic_type: t.topic_type as any,
      related_goal_stages: t.related_goal_stages as any,
      risk_notes: Array.isArray(t.risk_notes) ? t.risk_notes : (t.risk_notes ? [t.risk_notes] : [])
    })),
    narratives: (narrativesData || []).map(n => ({
      id: n.id,
      title: n.title,
      description: n.description,
      priority: n.priority,
      suggested_phase: n.suggested_phase as any,
      primary_goal_ids: n.narrative_goals?.map((ng: any) => ng.goal_id) || [],
      primary_topic_ids: n.narrative_topics?.map((nt: any) => nt.topic_id) || []
    })),
    segment_topic_matrix: matrix.map(m => ({
      segment_id: m.segment_id,
      topic_id: m.topic_id,
      importance: m.importance as any,
      role: m.role as any,
      summary: m.summary
    }))
  }

  return structure
}
