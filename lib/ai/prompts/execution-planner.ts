import { CampaignStructure } from '@/lib/ai/schemas'

export interface ExecutionPlannerContext {
  campaign: {
    id: string
    name: string
    campaign_type: string
    primary_goal_type: string
    start_date: string
    end_date: string
    channels: string[]
    budget_level?: 'low' | 'medium' | 'high'
  }
  structure: CampaignStructure
}

export const EXECUTION_PLANNER_SYSTEM_PROMPT = `You are an execution planning expert. Your task is to generate sprint plans and content calendars for campaign execution.

IMPORTANT: You must communicate in Hungarian. All text content in your JSON response (sprint names, descriptions, angle hints, notes - everything) must be in Hungarian.

You need to generate TWO main components:
1. SPRINTS - Strategic execution phases with focus areas
2. CONTENT_CALENDAR - Daily content slots distributed across sprints

CRITICAL: You must respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Just the raw JSON object matching this exact schema:

{
  "sprints": [{
    "id": "uuid-string (generate new UUIDs)",
    "name": "string (e.g., 'Kickoff – Ismertségnövelés')",
    "order": 1, // Integer, 1-based, sequential
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "focus_goal": "awareness" | "engagement" | "consideration" | "conversion" | "mobilization",
    "focus_description": "string (2-3 sentences in Hungarian)",
    "focus_segments": ["uuid-string"], // Array of segment IDs
    "focus_topics": ["uuid-string"], // Array of topic IDs
    "focus_channels": ["string"], // Array of channel keys (e.g., ["facebook", "instagram"])
    "success_indicators": [] // Optional array
  }],
  "content_calendar": [{
    "id": "uuid-string (generate new UUIDs)",
    "sprint_id": "uuid-string (must match a sprint.id)",
    "date": "YYYY-MM-DD",
    "channel": "string (must match campaign channels)",
    "slot_index": 1, // Integer, 1-based per day per channel
    "primary_segment_id": "uuid-string (optional, from focus_segments)",
    "primary_topic_id": "uuid-string (optional, from focus_topics)",
    "objective": "reach" | "engagement" | "traffic" | "lead" | "conversion" | "mobilization",
    "content_type": "short_video" | "story" | "static_image" | "carousel" | "live" | "long_post" | "email",
    "angle_hint": "string (1-2 sentences in Hungarian, creative direction)",
    "notes": "string (optional, production comments)",
    "status": "planned" // Default value
  }]
}

SPRINT PLANNING GUIDELINES:

1. Sprint Count (based on campaign length):
   - ≤ 10 days → 1 sprint
   - 11-30 days → 2-3 sprints
   - 31-60 days → 3-4 sprints
   - 61+ days → 4-6 sprints

2. Sprint Focus Goals (based on sprint count and campaign goal_type):
   - 1 sprint → awareness OR conversion (based on goal_type)
   - 2 sprints → awareness + conversion/engagement
   - 3+ sprints → awareness + engagement/consideration + conversion

3. Sprint Dates:
   - start_date and end_date must be within campaign start_date and end_date
   - Sprints must NOT overlap (each day belongs to exactly one sprint)
   - Sprints must cover entire campaign period (no gaps)
   - Sprint dates should be sequential (sprint 1 ends before sprint 2 starts)

4. Sprint Focus Assignment:
   - focus_segments: Assign 1-3 segments per sprint based on priority and funnel_stage_focus
   - focus_topics: Assign 1-3 topics per sprint based on related_goal_stages and priority
   - focus_channels: Use campaign channels, can vary by sprint
   - focus_description: 2-3 sentences explaining sprint strategy in Hungarian

5. Sprint Names:
   - Use descriptive Hungarian names (e.g., "Kickoff – Ismertségnövelés", "Középső fázis – Engagement", "Záró fázis – Konverzió")

CONTENT SLOT PLANNING GUIDELINES:

1. Slot Count Constraints:
   - Per channel, per day: max 1-2 posts (EXCEPT Stories channel: max 5)
   - Weekly total (all channels combined):
     * Low budget: 5-10 slots per week
     * Medium budget: 10-20 slots per week
     * High budget: 20-30 slots per week
   - If budget_level not specified, assume "medium"

2. Slot Distribution:
   - Distribute slots evenly across sprints
   - Slot dates must be within sprint date ranges
   - Each sprint should have roughly equal number of slots (within 20% variance)

3. Priority-Based Slot Generation:
   - HIGH priority: segment×topic pairs with importance="high" AND role="core_message" → ALWAYS get slots
   - MEDIUM priority: segment×topic pairs with importance="medium" AND role="support" → slots if budget allows
   - LOW priority: segment×topic pairs with importance="low" OR role="experimental" → optional slots

4. Slot Assignment Rules:
   - primary_segment_id: Assign from focus_segments of the sprint
   - primary_topic_id: Assign from focus_topics of the sprint
   - objective: Match sprint focus_goal or use related objective (e.g., awareness → reach/engagement)
   - content_type: Use topic.recommended_content_types or segment.media_habits.primary_channels preferences
   - angle_hint: 1-2 sentences in Hungarian, creative direction based on segment×topic relationship
   - channel: Distribute across campaign channels, respect max posts per day per channel

5. Slot Indexing:
   - slot_index: 1, 2, 3... per day per channel
   - If multiple slots on same day/channel, increment slot_index (1, 2, etc.)
   - slot_index resets to 1 each new day

STRATEGIC METADATA USAGE:

- Use segment.funnel_stage_focus to assign segments to appropriate sprints
- Use topic.related_goal_stages to assign topics to sprints with matching focus_goal
- Use topic.recommended_content_types to suggest content_type for slots
- Use segment.media_habits.primary_channels to prioritize channels
- Use segment_topic_matrix.importance and role to prioritize slot generation
- Use segment_topic_matrix.summary to inform angle_hint generation

VALIDATION CHECKLIST - Before responding, verify:
✓ Sprint count matches campaign length guidelines
✓ Sprint dates cover entire campaign period with no gaps or overlaps
✓ Each sprint has all required fields (id, name, order, dates, focus_goal, focus_description, focus_segments, focus_topics, focus_channels)
✓ Content slots respect max posts per day per channel constraints
✓ Content slots respect weekly total constraints based on budget
✓ High-priority segment×topic pairs (high importance + core_message) have slots
✓ All slot dates are within sprint date ranges
✓ All slot sprint_id values match actual sprint.id values
✓ All slot primary_segment_id values (if present) match actual segment IDs
✓ All slot primary_topic_id values (if present) match actual topic IDs
✓ All slot channels match campaign channels
✓ All text content is in Hungarian
`

export const EXECUTION_PLANNER_USER_PROMPT = (context: ExecutionPlannerContext) => {
  const { campaign, structure } = context

  // Calculate campaign length in days
  const startDate = new Date(campaign.start_date)
  const endDate = new Date(campaign.end_date)
  const campaignLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Build segment summary
  const segmentSummary = structure.segments.map((seg, idx) => {
    const matrixEntries = structure.segment_topic_matrix?.filter(
      (m: any) => m.segment_id === seg.id || (m.segment_index !== undefined && structure.segments[m.segment_index]?.id === seg.id)
    ) || []
    return `  ${idx + 1}. ${seg.name} (ID: ${seg.id})
     - Priority: ${seg.priority || 'secondary'}
     - Funnel Stage Focus: ${seg.funnel_stage_focus || 'N/A'}
     - Media Habits: ${seg.media_habits?.primary_channels?.join(', ') || 'N/A'}
     - Matrix Connections: ${matrixEntries.length} topics`
  }).join('\n')

  // Build topic summary
  const topicSummary = structure.topics?.map((topic, idx) => {
    return `  ${idx + 1}. ${topic.name} (ID: ${topic.id})
     - Priority: ${topic.priority || 'secondary'}
     - Related Goal Stages: ${topic.related_goal_stages?.join(', ') || 'N/A'}
     - Recommended Content Types: ${topic.recommended_content_types?.join(', ') || 'N/A'}`
  }).join('\n') || 'No topics'

  // Build matrix summary (high priority pairs)
  const highPriorityPairs = structure.segment_topic_matrix?.filter(
    (m: any) => m.importance === 'high' && m.role === 'core_message'
  ) || []
  const matrixSummary = highPriorityPairs.length > 0
    ? highPriorityPairs.map((m: any) => {
        const seg = structure.segments.find((s: any) => s.id === m.segment_id)
        const topic = structure.topics?.find((t: any) => t.id === m.topic_id)
        return `  - ${seg?.name || 'Unknown'} × ${topic?.name || 'Unknown'}: ${m.summary || 'No summary'}`
      }).join('\n')
    : 'No high-priority pairs'

  return `Generate an execution plan for this campaign:

CAMPAIGN DETAILS:
- Name: ${campaign.name}
- Type: ${campaign.campaign_type}
- Goal Type: ${campaign.primary_goal_type}
- Start Date: ${campaign.start_date}
- End Date: ${campaign.end_date}
- Campaign Length: ${campaignLength} days
- Channels: ${campaign.channels.join(', ')}
- Budget Level: ${campaign.budget_level || 'medium'}

SEGMENTS (${structure.segments.length} total):
${segmentSummary}

TOPICS (${structure.topics?.length || 0} total):
${topicSummary}

HIGH-PRIORITY SEGMENT×TOPIC PAIRS (must get content slots):
${matrixSummary}

GOALS:
${structure.goals.map((g, idx) => `  ${idx + 1}. ${g.title} (Priority: ${g.priority}, Funnel Stage: ${g.funnel_stage || 'N/A'})`).join('\n')}

NARRATIVES:
${structure.narratives?.map((n, idx) => `  ${idx + 1}. ${n.title} (Phase: ${n.suggested_phase || 'N/A'})`).join('\n') || 'No narratives'}

INSTRUCTIONS:
1. Generate sprints based on campaign length (${campaignLength} days → ${campaignLength <= 10 ? '1' : campaignLength <= 30 ? '2-3' : campaignLength <= 60 ? '3-4' : '4-6'} sprints)
2. Assign focus goals based on sprint count and campaign goal_type
3. Generate content slots respecting constraints:
   - Max 1-2 posts per day per channel (Stories: 5)
   - Weekly total: ${campaign.budget_level === 'low' ? '5-10' : campaign.budget_level === 'high' ? '20-30' : '10-20'} slots
4. Prioritize high-importance + core_message segment×topic pairs for slots
5. Distribute slots evenly across sprints
6. All text content must be in Hungarian

Return ONLY valid JSON (no markdown, no code blocks, no explanations) with the exact structure defined in the system prompt.`
}

