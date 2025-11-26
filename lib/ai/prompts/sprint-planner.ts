import { CampaignStructure } from '@/lib/ai/schemas'

export interface SprintPlannerContext {
  campaign: {
    id: string
    name: string
    campaign_type: string
    primary_goal_type: string
    start_date: string
    end_date: string
    channels: string[]
  }
  structure: CampaignStructure
  sprintCount: number
  sprintDateRanges: Array<{ start_date: string; end_date: string }>
  expectedFocusStages: string[]
  campaignDurationDays: number
  recommendedVolumes: Array<{
    sprintIndex: number
    total: number
    video: number
    stories: number
  }>
}

export const SPRINT_PLANNER_SYSTEM_PROMPT = `You are a sprint planning expert. Your task is to generate ONLY sprint plans for campaign execution (NO content calendar).

IMPORTANT: You must communicate in Hungarian. All text content in your JSON response (sprint names, descriptions, key messages - everything) must be in Hungarian.

You need to generate ONLY SPRINTS - Strategic execution phases with focus areas and enhanced metadata.

CRITICAL: You must respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Just the raw JSON object matching this exact schema:

{
  "sprints": [{
    "id": "uuid-string (generate new UUIDs)",
    "name": "string (e.g., 'Sprint 1: Ismertségnövelés')",
    "order": 1, // Integer, 1-based, sequential
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",

    // Legacy fields (required for backward compatibility)
    "focus_goal": "awareness" | "engagement" | "consideration" | "conversion" | "mobilization",
    "focus_description": "string (2-3 sentences in Hungarian)",
    "focus_segments": ["uuid-string"], // Array of segment IDs
    "focus_topics": ["uuid-string"], // Array of topic IDs
    "focus_channels": ["string"], // Array of channel keys
    "success_indicators": [], // Optional array

    // Enhanced metadata fields (Phase 2 - Story 5.6)
    "focus_stage": "awareness" | "engagement" | "consideration" | "conversion" | "mobilization",
    "focus_goals": ["uuid-string"], // 1-3 goal IDs from campaign
    "focus_segments_primary": ["uuid-string"], // 1-2 primary segment IDs
    "focus_segments_secondary": ["uuid-string"], // 0-2 secondary segment IDs
    "focus_topics_primary": ["uuid-string"], // 1-2 primary topic IDs
    "focus_topics_secondary": ["uuid-string"], // 0-2 secondary topic IDs
    "focus_channels_primary": ["string"], // 1-2 primary channels
    "focus_channels_secondary": ["string"], // 0-2 secondary channels
    "suggested_weekly_post_volume": {
      "total_posts_per_week": 10, // Integer, positive
      "video_posts_per_week": 3, // Integer, non-negative
      "stories_per_week": 5 // Integer, non-negative, optional
    },
    "narrative_emphasis": ["uuid-string"], // 1-2 narrative IDs
    "key_messages_summary": "string (2-3 sentences in Hungarian)",
    "success_criteria": ["string"], // 1+ success criteria in Hungarian
    "risks_and_watchouts": ["string"] // 2-4 risks in Hungarian
  }]
}

SPRINT PLANNING GUIDELINES:

1. Sprint Count and Dates:
   - Use provided sprintCount and sprintDateRanges exactly as given
   - Each sprint must use the corresponding date range
   - Sprint order starts from 1 and increments sequentially

2. Focus Stage Progression (follow funnel logic):
   - Use provided expectedFocusStages array for focus_stage values
   - Focus stages should follow funnel progression: awareness → engagement → consideration → conversion → mobilization
   - focus_goal (legacy) should match focus_stage for consistency

3. Sprint Names:
   - Use descriptive Hungarian names that reflect the focus stage
   - Format: "Sprint X: [Stage Description]"
   - Examples: "Sprint 1: Ismertségnövelés", "Sprint 2: Engagement és interakció", "Sprint 3: Konverzió"

4. Segment and Topic Assignment:
   - focus_segments (legacy): Assign 1-3 segments per sprint based on priority and funnel_stage_focus
   - focus_segments_primary: 1-2 most important segments for this sprint
   - focus_segments_secondary: 0-2 additional segments if relevant
   - focus_topics (legacy): Assign 1-3 topics per sprint based on related_goal_stages and priority
   - focus_topics_primary: 1-2 most important topics for this sprint
   - focus_topics_secondary: 0-2 supporting topics if relevant

5. Channel Assignment:
   - focus_channels (legacy): Use campaign channels, can vary by sprint
   - focus_channels_primary: 1-2 main channels for this sprint
   - focus_channels_secondary: 0-2 supporting channels if budget allows

6. Goal Assignment:
   - focus_goals: Assign 1-3 goal IDs that match the sprint's focus stage
   - Prioritize goals with matching funnel_stage or related priority

7. Narrative Assignment:
   - narrative_emphasis: Assign 1-2 narrative IDs that fit the sprint phase
   - Use narrative.suggested_phase to match early/mid/late campaign phases

8. Weekly Post Volume:
   - STRICTLY FOLLOW the "Recommended Post Volume" provided in the user prompt for each sprint.
   - The user prompt will specify the exact target numbers for total posts, videos, and stories.
   - Use these numbers to populate the 'suggested_weekly_post_volume' object.

9. Content Requirements:
   - focus_description: 2-3 sentences explaining sprint strategy in Hungarian
   - key_messages_summary: 2-3 sentences summarizing key messaging in Hungarian
   - success_criteria: 1+ specific, measurable criteria in Hungarian
   - risks_and_watchouts: 2-4 potential risks and mitigation approaches in Hungarian

STRATEGIC METADATA USAGE:

- Use segment.funnel_stage_focus to assign segments to appropriate sprints
- Use segment.priority ('primary'/'secondary') to determine primary vs secondary focus
- Use topic.related_goal_stages to assign topics to sprints with matching focus_stage
- Use topic.priority ('primary'/'secondary') to determine primary vs secondary focus
- Use goal.funnel_stage to match goals with sprint focus_stage
- Use goal.priority (1=high, 2=medium, 3=low) to prioritize goal assignment
- Use narrative.suggested_phase to match narratives with sprint progression
- Use segment_topic_matrix.importance and role to understand segment-topic relationships

VALIDATION CHECKLIST - Before responding, verify:
✓ Sprint count matches provided sprintCount exactly
✓ Sprint dates use provided sprintDateRanges exactly
✓ Sprint order is sequential (1, 2, 3...)
✓ Focus stages follow provided expectedFocusStages progression
✓ Each sprint has all required fields (both legacy and enhanced)
✓ focus_segments arrays contain valid segment IDs from campaign
✓ focus_topics arrays contain valid topic IDs from campaign
✓ focus_goals arrays contain valid goal IDs from campaign
✓ narrative_emphasis arrays contain valid narrative IDs from campaign
✓ focus_channels arrays contain valid channel names from campaign
✓ All text content is in Hungarian
✓ suggested_weekly_post_volume matches the recommended volumes from the prompt
✓ success_criteria and risks_and_watchouts are non-empty arrays`

export const SPRINT_PLANNER_USER_PROMPT = (context: SprintPlannerContext) => {
  const { campaign, structure, sprintCount, sprintDateRanges, expectedFocusStages, campaignDurationDays, recommendedVolumes } = context

  // Build segment summary
  const segmentSummary = structure.segments.map((seg, idx) => {
    return `  ${idx + 1}. ${seg.name} (ID: ${seg.id})
     - Priority: ${seg.priority || 'secondary'}
     - Funnel Stage Focus: ${seg.funnel_stage_focus || 'N/A'}`
  }).join('\n')

  // Build topic summary
  const topicSummary = structure.topics?.map((topic, idx) => {
    return `  ${idx + 1}. ${topic.name} (ID: ${topic.id})
     - Priority: ${topic.priority || 'secondary'}
     - Related Goal Stages: ${topic.related_goal_stages?.join(', ') || 'N/A'}`
  }).join('\n') || 'No topics'

  // Build goal summary
  const goalSummary = structure.goals.map((goal, idx) => {
    // Goals from AI generation might not have IDs yet
    const goalId = (goal as any).id || 'N/A'
    return `  ${idx + 1}. ${goal.title} (ID: ${goalId})
     - Priority: ${goal.priority} (1=high, 2=medium, 3=low)
     - Funnel Stage: ${goal.funnel_stage || 'N/A'}`
  }).join('\n')

  // Build narrative summary
  const narrativeSummary = structure.narratives?.map((narrative, idx) => {
    // Narratives from AI generation might not have IDs yet
    const narrativeId = (narrative as any).id || 'N/A'
    return `  ${idx + 1}. ${narrative.title} (ID: ${narrativeId})
     - Suggested Phase: ${narrative.suggested_phase || 'N/A'}`
  }).join('\n') || 'No narratives'

  // Build sprint date ranges summary
  const sprintRangesSummary = sprintDateRanges.map((range, idx) => {
    const vol = recommendedVolumes.find(v => v.sprintIndex === idx + 1)
    const volInfo = vol 
      ? `\n    Recommended Volume: Total ${vol.total}/week (Video: ${vol.video}, Stories: ${vol.stories})`
      : ''
    
    return `  Sprint ${idx + 1}: ${range.start_date} → ${range.end_date} (Focus Stage: ${expectedFocusStages[idx]})${volInfo}`
  }).join('\n')

  return `Generate sprint plans for this campaign:

CAMPAIGN DETAILS:
- Name: ${campaign.name}
- Type: ${campaign.campaign_type}
- Goal Type: ${campaign.primary_goal_type}
- Start Date: ${campaign.start_date}
- End Date: ${campaign.end_date}
- Campaign Length: ${campaignDurationDays} days
- Channels: ${campaign.channels.join(', ')}

SPRINT REQUIREMENTS:
- Sprint Count: ${sprintCount}
- Expected Focus Stage Progression: ${expectedFocusStages.join(' → ')}

SPRINT DATE RANGES & VOLUMES (use these exactly):
${sprintRangesSummary}

SEGMENTS (${structure.segments.length} total):
${segmentSummary}

TOPICS (${structure.topics?.length || 0} total):
${topicSummary}

GOALS (${structure.goals.length} total):
${goalSummary}

NARRATIVES (${structure.narratives?.length || 0} total):
${narrativeSummary}

INSTRUCTIONS:
1. Generate exactly ${sprintCount} sprints using the provided date ranges
2. Follow the expected focus stage progression: ${expectedFocusStages.join(' → ')}
3. Assign segments and topics based on priority and funnel stage alignment
4. Include both legacy fields (for backward compatibility) and enhanced metadata fields
5. Ensure all IDs reference valid campaign entities
6. All text content must be in Hungarian
7. Make sprints strategic and actionable for campaign execution
8. USE THE RECOMMENDED POST VOLUMES provided for each sprint.

Return ONLY valid JSON (no markdown, no code blocks, no explanations) with the exact structure defined in the system prompt.`
}