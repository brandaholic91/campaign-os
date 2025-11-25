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
You MUST always communicate in Hungarian (magyar nyelv).

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
- id: A valid UUID v4 format (e.g., "550e8400-e29b-41d4-a716-446655440000"). CRITICAL: Must be a valid UUID format.
- sprint_id: The provided sprint ID
- date: YYYY-MM-DD string (MUST be within sprint range)
- channel: One of the focus channels
- slot_index: 1-based index for that day/channel
- primary_segment_id: ID of a focus segment (optional but recommended)
- primary_topic_id: ID of a focus topic (optional but recommended)
- objective: EXACTLY one of these values ONLY (do NOT use variations like "mutual engagement", "awareness", etc.):
  * 'reach'
  * 'engagement' 
  * 'traffic'
  * 'lead'
  * 'conversion'
  * 'mobilization'
- content_type: EXACTLY one of these values ONLY:
  * 'short_video'
  * 'story'
  * 'static_image'
  * 'carousel'
  * 'live'
  * 'long_post'
  * 'email'
- angle_hint: A brief 3-5 word direction for the content creator
- notes: Optional strategic notes
- status: 'planned'

Do not include any explanation or markdown formatting, just the raw JSON.`

export const CONTENT_SLOT_PLANNER_USER_PROMPT = (context: ContentSlotPlannerContext) => {
  const { sprint, campaign, structure, focus_segments, focus_topics, focus_channels, volume_override } = context
  
  // Use suggested_weekly_post_volume from sprint, with fallback to defaults
  const volume = sprint.suggested_weekly_post_volume || {
    total_posts_per_week: 5,
    video_posts_per_week: 1,
    stories_per_week: 0
  }

  // Calculate sprint duration in days and weeks
  const startDate = new Date(sprint.start_date)
  const endDate = new Date(sprint.end_date)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end days
  const weeks = daysDiff / 7
  const targetTotalSlots = Math.ceil(volume.total_posts_per_week * weeks)
  const targetVideoSlots = Math.ceil(volume.video_posts_per_week * weeks)
  const targetStorySlots = Math.ceil((volume.stories_per_week || 0) * weeks)

  return `
GENERATE CONTENT SLOTS FOR SPRINT: "${sprint.name}"

SPRINT CONTEXT:
- ID: ${sprint.id}
- Date Range: ${sprint.start_date} to ${sprint.end_date}
- Duration: ${daysDiff} days (${weeks.toFixed(2)} weeks)
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

VOLUME CONSTRAINTS:
- Per Week: ${volume.total_posts_per_week} total posts, ${volume.video_posts_per_week} video posts, ${volume.stories_per_week || 0} stories
- For ${weeks.toFixed(2)} weeks: Target ${targetTotalSlots} total slots, ${targetVideoSlots} video slots, ${targetStorySlots} story slots
- Generate approximately ${targetTotalSlots} content slots total

INSTRUCTIONS:
1. CRITICAL: You MUST generate exactly ${targetTotalSlots} content slots (or very close to this number - between ${Math.max(1, Math.floor(targetTotalSlots * 0.95))} and ${Math.ceil(targetTotalSlots * 1.05)}). This is NOT optional - ${targetTotalSlots} slots are required for this sprint duration.
2. Generate slots covering ALL dates from ${sprint.start_date} to ${sprint.end_date} (${daysDiff} days total).
3. The target number is calculated as: ${volume.total_posts_per_week} posts/week × ${weeks.toFixed(2)} weeks = ${targetTotalSlots} slots. You must generate this many slots.
4. Ensure the mix matches volume constraints: approximately ${targetVideoSlots} video posts (${volume.video_posts_per_week}/week) and ${targetStorySlots} story posts (${volume.stories_per_week || 0}/week).
5. Distribute slots evenly across all ${daysDiff} days - do not skip days. Each day should have slots.
6. Assign specific segments and topics from the provided lists to each slot where relevant.
7. Ensure objectives align with the focus stage (${sprint.focus_stage}).
   Use EXACTLY these values (no variations):
   - Awareness -> use 'reach' or 'traffic' (NOT "awareness")
   - Engagement -> use 'engagement' (NOT "mutual engagement" or "community engagement")
   - Consideration -> use 'traffic' or 'engagement'
   - Conversion -> use 'conversion' or 'lead'
   - Mobilization -> use 'mobilization'
8. Maximum 2 posts per day per channel (exception: 'story' channel type allows up to 5 per day).
9. IMPORTANT: All text content (angle_hint, notes) MUST be in Hungarian (magyar nyelv).

REMINDER: Generate ${targetTotalSlots} content slots. This is the target number.

Return JSON object: { "content_slots": [...] }
`
}
