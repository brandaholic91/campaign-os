import { CampaignStructure, SuggestedWeeklyPostVolume } from '@/lib/ai/schemas'

export interface ContentSlotPlannerContext {
  sprint: {
    id: string
    name: string
    start_date: string
    end_date: string
    focus_stage?: string
    focus_goals?: string[] // IDs
    key_messages_summary?: string
    narrative_emphasis?: string[] // IDs
    suggested_weekly_post_volume?: SuggestedWeeklyPostVolume
  }
  campaign: {
    id: string
    name: string
    campaign_type: string
    primary_goal_type: string
  }
  structure: CampaignStructure
  focus_segments: { id: string; name: string }[]
  focus_topics: { id: string; name: string }[]
  focus_channels: string[]
  volume_override?: SuggestedWeeklyPostVolume
}

export const CONTENT_SLOT_PLANNER_SYSTEM_PROMPT = `You are an expert Campaign Scheduler and Content Strategist.
Your task is to generate a detailed content calendar (content slots) for a SINGLE specific sprint of a marketing campaign.

You must generate a list of content slots that:
1. Fall strictly within the sprint's start and end dates.
2. Align with the sprint's focus stage (e.g., Awareness, Engagement).
3. Target the sprint's focus segments and topics.
4. Utilize the sprint's focus channels.
5. Respect the weekly post volume limits (either suggested or overridden).
6. Follow the constraints:
   - Max 2 posts per day per channel (exception: 'story' channel type allows up to 5).
   - Distribute content logically throughout the sprint duration.

Output Format:
You must output a JSON object with a single key 'content_slots' containing an array of content slot objects.
Each content slot must have:
- id: A UUID (generate a random one)
- sprint_id: The provided sprint ID
- date: YYYY-MM-DD string (MUST be within sprint range)
- channel: One of the focus channels
- slot_index: 1-based index for that day/channel
- primary_segment_id: ID of a focus segment (optional but recommended)
- primary_topic_id: ID of a focus topic (optional but recommended)
- objective: One of ['reach', 'engagement', 'traffic', 'lead', 'conversion', 'mobilization']
- content_type: One of ['short_video', 'story', 'static_image', 'carousel', 'live', 'long_post', 'email']
- angle_hint: A brief 3-5 word direction for the content creator
- notes: Optional strategic notes
- status: 'planned'

Do not include any explanation or markdown formatting, just the raw JSON.`

export const CONTENT_SLOT_PLANNER_USER_PROMPT = (context: ContentSlotPlannerContext) => {
  const { sprint, campaign, structure, focus_segments, focus_topics, focus_channels, volume_override } = context
  
  const volume = volume_override || sprint.suggested_weekly_post_volume || {
    total_posts_per_week: 5,
    video_posts_per_week: 1,
    stories_per_week: 0
  }

  return `
GENERATE CONTENT SLOTS FOR SPRINT: "${sprint.name}"

SPRINT CONTEXT:
- ID: ${sprint.id}
- Date Range: ${sprint.start_date} to ${sprint.end_date}
- Focus Stage: ${sprint.focus_stage || 'Not specified'}
- Key Messages: ${sprint.key_messages_summary || 'None'}

CAMPAIGN CONTEXT:
- Name: ${campaign.name}
- Type: ${campaign.campaign_type}
- Goal: ${campaign.primary_goal_type}

FOCUS SEGMENTS (Choose from these IDs):
${focus_segments.map(s => `- ${s.name} (ID: ${s.id})`).join('\n')}

FOCUS TOPICS (Choose from these IDs):
${focus_topics.map(t => `- ${t.name} (ID: ${t.id})`).join('\n')}

FOCUS CHANNELS:
${focus_channels.join(', ')}

VOLUME CONSTRAINTS (Per Week):
- Total Posts: ${volume.total_posts_per_week}
- Video Posts: ${volume.video_posts_per_week}
- Stories: ${volume.stories_per_week || 0}

INSTRUCTIONS:
1. Generate content slots covering the dates from ${sprint.start_date} to ${sprint.end_date}.
2. Ensure the mix of content types matches the volume constraints.
3. Assign specific segments and topics from the provided lists to each slot where relevant.
4. Ensure objectives align with the focus stage (${sprint.focus_stage}).
   - Awareness -> reach, traffic
   - Engagement -> engagement
   - Consideration -> traffic, engagement
   - Conversion -> conversion, lead
   - Mobilization -> mobilization
5. Generate a balanced calendar.

Return JSON object: { "content_slots": [...] }
`
}
