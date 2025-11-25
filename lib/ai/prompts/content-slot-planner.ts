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
  message_strategies_map?: { [key: string]: any } // Map: "segment_id:topic_id" -> strategy object
}

export const CONTENT_SLOT_PLANNER_SYSTEM_PROMPT = `You are an expert Campaign Scheduler and Content Strategist.
You MUST always communicate in Hungarian (magyar nyelv).

Your task is to generate a detailed content calendar (tactical content slots only, NO COPY) for a SINGLE specific sprint of a marketing campaign.

CRITICAL: You are generating ONLY tactical planning slots (when, where, who, what type, why). You will NOT generate any copy (hook, body, CTA text). Copy will be created later based on these slots.

You must generate a list of content slots that:
1. Fall strictly within the sprint's start and end dates.
2. Align with the sprint's focus stage (e.g., Awareness, Engagement).
3. Target the sprint's focus segments and topics (primary + optional secondary).
4. Utilize the sprint's focus channels.
5. Respect the weekly post volume limits (either suggested or overridden).
6. Follow the constraints:
   - Max 2 posts per day per channel (exception: 'story' channel type allows up to 5).
   - Distribute content logically throughout the sprint duration.
7. Use message strategies (if available for segment × topic combinations) to inform:
   - angle_type selection (from strategy_core.core_message, framing_type)
   - cta_type selection (from cta_funnel.cta_patterns)
   - tone_override (from style_tone.tone_profile, emotional_temperature)
   - angle_hint (from strategy_core.positioning_statement, core_message)

Output Format:
You must output a JSON object with a single key 'content_slots' containing an array of content slot objects.
Each content slot must have:

**Required Fields:**
- id: A valid UUID v4 format (e.g., "550e8400-e29b-41d4-a716-446655440000"). CRITICAL: Must be a valid UUID format.
- sprint_id: The provided sprint ID
- campaign_id: The campaign ID (will be provided in context)
- date: YYYY-MM-DD string (MUST be within sprint range)
- channel: One of the focus channels
- slot_index: 1-based index for that day/channel
- funnel_stage: EXACTLY one of these values (from sprint focus_stage or infer from objective):
  * 'awareness'
  * 'engagement'
  * 'consideration'
  * 'conversion'
  * 'mobilization'
- related_goal_ids: Array of 1-2 goal UUIDs (from sprint focus_goals)
- angle_type: EXACTLY one of these values:
  * 'story' - Personal narrative, journey, behind-the-scenes (use if strategy framing_type is narrative or emotional)
  * 'proof' - Data, statistics, evidence, results (use if strategy core_message emphasizes proof points)
  * 'how_to' - Tutorial, guide, educational content (use if strategy is informative or educational)
  * 'comparison' - Before/after, us vs them, alternatives (use if strategy positions against competition)
  * 'behind_the_scenes' - Process, transparency, authenticity (use if strategy tone_profile emphasizes transparency)
  * 'testimonial' - User stories, social proof, reviews (use if strategy includes proof_points with testimonials)
  * 'other' - Other angle (fallback)

  Selection logic:
  - If message strategy available for this segment × topic: use strategy_core.framing_type or core_message to select
  - If no strategy: infer from objective and funnel_stage (e.g., awareness → story/how_to, conversion → proof/testimonial)

- cta_type: EXACTLY one of these values:
  * 'soft_info' - Informational, no hard ask (awareness stage, soft engagement)
  * 'learn_more' - Click to learn more, read article (engagement, consideration)
  * 'signup' - Newsletter, email signup, registration (lead generation)
  * 'donate' - Financial contribution (mobilization for nonprofits)
  * 'attend_event' - Event registration, RSVP (mobilization)
  * 'share' - Share, tag, repost (engagement, reach)
  * 'comment' - Comment, react, discuss (engagement)

  Selection logic:
  - If message strategy available: use cta_funnel.cta_patterns to select
  - If no strategy: match to objective and funnel_stage (e.g., reach → share, lead → signup, mobilization → attend_event/donate)

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
- status: 'planned'

**Optional Fields:**
- primary_segment_id: ID of a focus segment (strongly recommended)
- primary_topic_id: ID of a focus topic (strongly recommended)
- secondary_segment_ids: Array of 0-2 additional segment UUIDs (optional, use when slot targets multiple audiences)
- secondary_topic_ids: Array of 0-2 additional topic UUIDs (optional, use when slot covers multiple topics)
- time_of_day: EXACTLY one of these values or omit:
  * 'morning' (6-11 AM)
  * 'midday' (11 AM - 3 PM)
  * 'evening' (3 PM - 10 PM)
  * 'unspecified'

  Selection logic: Base on channel best practices (e.g., Facebook → evening, LinkedIn → morning/midday, Instagram → midday/evening)

- tone_override: Optional string (ONLY if this specific slot needs different tone than campaign default)
  - If message strategy available: use style_tone.tone_profile or emotional_temperature if slot context requires it
  - If no strategy: only use if slot needs different tone (e.g., serious topic in lighthearted campaign)

- angle_hint: Brief 3-5 word direction for content creator
  - If message strategy available: use strategy_core.positioning_statement or core_message
  - If no strategy: infer from angle_type, objective, topic

- notes: Optional strategic notes

Do not include any explanation or markdown formatting, just the raw JSON.`

export const CONTENT_SLOT_PLANNER_USER_PROMPT = (context: ContentSlotPlannerContext) => {
  const { sprint, campaign, structure, focus_segments, focus_topics, focus_channels, volume_override, message_strategies_map } = context

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

  // Build message strategy context
  let strategyContext = ''
  if (message_strategies_map && Object.keys(message_strategies_map).length > 0) {
    strategyContext = `\nMESSAGE STRATEGIES (Use these to inform angle_type, cta_type, tone_override, angle_hint):\n`
    for (const [key, strategy] of Object.entries(message_strategies_map)) {
      const [segmentId, topicId] = key.split(':')
      const segment = focus_segments.find(s => s.id === segmentId)
      const topic = focus_topics.find(t => t.id === topicId)
      if (segment && topic && strategy) {
        strategyContext += `\n[${segment.name} × ${topic.name}]:\n`
        if (strategy.strategy_core) {
          strategyContext += `  Core Message: ${strategy.strategy_core.core_message || 'N/A'}\n`
          strategyContext += `  Positioning: ${strategy.strategy_core.positioning_statement || 'N/A'}\n`
        }
        if (strategy.style_tone) {
          strategyContext += `  Tone: ${strategy.style_tone.tone_profile?.description || 'N/A'}\n`
        }
        if (strategy.cta_funnel) {
          strategyContext += `  CTA Patterns: ${Array.isArray(strategy.cta_funnel.cta_patterns) ? strategy.cta_funnel.cta_patterns.join(', ') : 'N/A'}\n`
        }
      }
    }
  } else {
    strategyContext = `\nMESSAGE STRATEGIES: None available - infer angle_type, cta_type from objective and funnel_stage.\n`
  }

  return `
GENERATE CONTENT SLOTS FOR SPRINT: "${sprint.name}"

SPRINT CONTEXT:
- ID: ${sprint.id}
- Campaign ID: ${campaign.id} (REQUIRED: Include this as campaign_id in each slot)
- Date Range: ${sprint.start_date} to ${sprint.end_date}
- Duration: ${daysDiff} days (${weeks.toFixed(2)} weeks)
- Focus Stage: ${sprint.focus_stage || 'Not specified'} (REQUIRED: Use this as funnel_stage in each slot)
- Focus Goals: ${sprint.focus_goals && sprint.focus_goals.length > 0 ? sprint.focus_goals.join(', ') : 'None'} (REQUIRED: Include 1-2 as related_goal_ids in each slot)
- Key Messages: ${sprint.key_messages_summary || 'None'}

CAMPAIGN CONTEXT:
- Name: ${campaign.name}
- Type: ${campaign.campaign_type}
- Goal: ${campaign.primary_goal_type}

FOCUS SEGMENTS (Choose from these IDs as primary_segment_id, optionally add 0-2 as secondary_segment_ids):
${focus_segments.map(s => `- ${s.name} (ID: ${s.id})`).join('\n')}

FOCUS TOPICS (Choose from these IDs as primary_topic_id, optionally add 0-2 as secondary_topic_ids):
${focus_topics.map(t => `- ${t.name} (ID: ${t.id})`).join('\n')}

FOCUS CHANNELS:
${focus_channels.join(', ')}
${strategyContext}
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
7. FOR EACH SLOT, you MUST include these NEW REQUIRED FIELDS:
   - campaign_id: ${campaign.id}
   - funnel_stage: Use sprint focus_stage (${sprint.focus_stage || 'awareness'})
   - related_goal_ids: Array of 1-2 goal IDs from sprint focus_goals
   - angle_type: Select from enum (story/proof/how_to/comparison/behind_the_scenes/testimonial/other) - use message strategy if available
   - cta_type: Select from enum (soft_info/learn_more/signup/donate/attend_event/share/comment) - use message strategy if available
   - OPTIONAL: secondary_segment_ids (0-2), secondary_topic_ids (0-2), time_of_day (morning/midday/evening), tone_override (if needed)
8. Ensure objectives align with the focus stage (${sprint.focus_stage}).
   Use EXACTLY these values (no variations):
   - Awareness -> use 'reach' or 'traffic' (NOT "awareness")
   - Engagement -> use 'engagement' (NOT "mutual engagement" or "community engagement")
   - Consideration -> use 'traffic' or 'engagement'
   - Conversion -> use 'conversion' or 'lead'
   - Mobilization -> use 'mobilization'
9. Maximum 2 posts per day per channel (exception: 'story' channel type allows up to 5 per day).
10. IMPORTANT: All text content (angle_hint, notes, tone_override) MUST be in Hungarian (magyar nyelv).

REMINDER: Generate ${targetTotalSlots} content slots with ALL required new fields. This is the target number.

Return JSON object: { "content_slots": [...] }
`
}
