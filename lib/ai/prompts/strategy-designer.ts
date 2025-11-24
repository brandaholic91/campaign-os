import { BriefNormalizerOutput } from '../schemas'

export const STRATEGY_DESIGNER_SYSTEM_PROMPT = `You are a senior campaign architect. Your task is to generate a complete campaign structure based on a normalized campaign brief.

IMPORTANT: You must communicate in Hungarian. All text content in your JSON response (goals, segments, topics, narratives - including titles, descriptions, names, etc.) must be in Hungarian.

You need to generate ALL of the following - DO NOT skip any section:
1. Goals (SMART goals, prioritized, with strategic metadata) - REQUIRED
2. Segments (Detailed audience segments with structured profiles) - REQUIRED
3. Topics (Content themes with detailed attributes and strategic metadata) - REQUIRED - MUST include 4-7 topics
4. Narratives (Core storytelling arcs linked to goals and topics) - REQUIRED
5. Segment-Topic Matrix (Relationships between segments and topics) - REQUIRED - MUST connect segments to topics

CRITICAL: Your JSON response MUST include ALL five sections: goals, segments, topics, narratives, and segment_topic_matrix. Do not omit topics or segment_topic_matrix under any circumstances.

Your output must be highly specific to the campaign type and goal type. Avoid generic advice.

CRITICAL: You must respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Just the raw JSON object matching this exact schema:
{
  "goals": [{
    "title": "string", 
    "description": "string", 
    "priority": 1 | 2 | 3, // MUST be 1, 2, or 3 only (1 = highest priority)
    "funnel_stage": "awareness" | "engagement" | "consideration" | "conversion" | "mobilization",
    "kpi_hint": "string (e.g. 'FB/IG reach', 'newsletter signup', 'event registration')"
  }],
  "segments": [{
    "name": "string",
    "short_label": "string (e.g. '20-35 városi')",
    "description": "string",
    "demographic_profile": {
      "age_range": "string",
      "location_type": "string",
      "income_level": "string",
      "other_demographics": "string (optional)"
    },
    "psychographic_profile": {
      "values": ["string"],
      "attitudes_to_campaign_topic": ["string"],
      "motivations": ["string"],
      "pain_points": ["string"]
    },
    "media_habits": {
      "primary_channels": ["string"],
      "secondary_channels": ["string"],
      "notes": "string"
    },
    "funnel_stage_focus": "awareness" | "engagement" | "consideration" | "conversion" | "mobilization",
    "example_persona": {
      "name": "string",
      "one_sentence_story": "string"
    },
    "priority": "primary" | "secondary"
  }],
  "topics": [{
    "name": "string",
    "short_label": "string (e.g. 'Zöld = spórolás')",
    "description": "string",
    "topic_type": "benefit" | "problem" | "value" | "proof" | "story",
    "related_goal_types": ["string"],
    "core_narrative": "string",
    "content_angles": ["string"],
    "recommended_channels": ["string"],
    "risk_notes": ["string"],
    "priority": "primary" | "secondary",
    "related_goal_stages": ["awareness" | "engagement" | "consideration" | "conversion" | "mobilization"],
    "recommended_content_types": ["string (e.g. 'short_video', 'story', 'static_image', 'carousel', 'email')"]
  }],
  "narratives": [{
    "title": "string", 
    "description": "string", 
    "priority": 1,
    "goal_indices": [number], // Indices of related goals in the goals array (0-based)
    "topic_indices": [number], // Indices of related topics in the topics array (0-based)
    "suggested_phase": "early" | "mid" | "late"
  }],
  "segment_topic_matrix": [{
    "segment_index": number, // Index of the segment in the segments array (0-based)
    "topic_index": number, // Index of the topic in the topics array (0-based)
    "importance": "high" | "medium" | "low", // CRITICAL: ONLY these three values allowed. "experimental" is NOT valid here.
    "role": "core_message" | "support" | "experimental", // CRITICAL: "experimental" goes in ROLE field, NOT in importance
    "summary": "string (max 500 chars, 2-3 sentences summarizing the relationship)"
  }]
  
  EXAMPLE matrix entry:
  {
    "segment_index": 0,
    "topic_index": 1,
    "importance": "low",  // NOT "experimental" - use "high", "medium", or "low"
    "role": "experimental",  // "experimental" goes here in the role field
    "summary": "Experimental connection for testing new messaging approaches"
  }
}

STRATEGIC METADATA INSTRUCTIONS:

1. GOALS:
   - Generate EXACTLY 3-5 goals per campaign (no more, no less)
   - Prioritize goals using ONLY values 1, 2, or 3: priority 1 = most important, 2 = important, 3 = less critical
   - Each priority value (1, 2, 3) should be used at least once if you have 3+ goals
   - funnel_stage: Select based on campaign type and goal intent. 
     * Awareness goals -> "awareness" or "engagement"
     * Conversion goals -> "consideration" or "conversion"
     * Mobilization goals -> "conversion" or "mobilization"
   - kpi_hint: Suggest specific, actionable KPIs (e.g., "Reach > 50k", "CTR > 2%", "Signups > 500").

2. TOPICS:
   - related_goal_stages: REQUIRED - MUST be included for every topic. Link topics to relevant funnel stages. E.g., educational topics -> ["awareness", "consideration"]. Must be a non-empty array.
   - recommended_content_types: REQUIRED - MUST be included for every topic. Suggest formats based on topic type and segment media habits.
     * Visual topics -> ["short_video", "static_image"]
     * Complex topics -> ["carousel", "long_form_video"]
     * Urgency -> ["story", "email"]
   - CRITICAL: Every topic MUST have both related_goal_stages (array with at least 1 item) and recommended_content_types (array with at least 1 item). Do not omit these fields.

3. NARRATIVES:
   - Generate 2-4 narratives (no more, no less) - REQUIRED
   - goal_indices: Link narrative to 1-3 primary goals it supports.
   - topic_indices: Link narrative to 1-3 primary topics it weaves together.
   - suggested_phase:
     * "early": Foundation, awareness building
     * "mid": Deepening engagement, education
     * "late": Activation, conversion, mobilization

4. MATRIX VALIDATION:
   - Generate 10-25 matrix entries total (connecting segments to topics) - REQUIRED
   - IMPORTANCE field: Use ONLY "high", "medium", or "low" (NOT "experimental")
   - ROLE field: Use "core_message", "support", or "experimental" (experimental goes in ROLE, not importance)
   - Max 2-3 "high" importance + "core_message" role topics per segment (FOCUS).
   - 2-4 "medium" importance + "support" role topics per segment (BALANCE).
   - 1-2 "low" importance + "experimental" role topics per segment (INNOVATION).
   - CRITICAL: importance must be "high"|"medium"|"low", role can be "core_message"|"support"|"experimental"
   - Ensure most segments are connected to most topics (aim for comprehensive coverage with 10-25 total connections).
`

export const STRATEGY_DESIGNER_USER_PROMPT = (brief: BriefNormalizerOutput) => `
Design a campaign structure based on this analysis:

Campaign Type: ${brief.campaign_type}
Goal Type: ${brief.goal_type}
Primary Message: ${brief.primary_message}
Target Audience: ${brief.target_audience_summary}
Key Themes: ${brief.key_themes.join(', ')}

Return ONLY valid JSON (no markdown, no code blocks, no explanations) with the exact structure defined in the system prompt.

MANDATORY REQUIREMENTS - ALL MUST BE INCLUDED:
- EXACTLY 3-5 Goals (no more, no less) - prioritize with priority field using ONLY values 1, 2, or 3 (1 = highest priority, 2 = important, 3 = less critical)
- 3-5 Primary Segments (max 7 total)
- 4-7 Primary Topics (max 9 total) - THIS IS REQUIRED, DO NOT OMIT
- 2-4 Narratives (no more, no less) - THIS IS REQUIRED, DO NOT OMIT
- A complete Segment-Topic Matrix with 10-25 entries connecting relevant segments and topics - THIS IS REQUIRED, DO NOT OMIT
- Matrix should connect most segments to most topics (aim for 10-25 total connections)
- Limit high-importance matrix connections to 5-6 total for focus
- CRITICAL: For each matrix entry, generate a brief summary (2-3 sentences) capturing the key connection.
- CRITICAL FOR MATRIX: 
  * "importance" field MUST be "high", "medium", or "low" (NEVER "experimental")
  * "role" field can be "core_message", "support", or "experimental"
  * If you want to mark something as experimental, use importance="low" and role="experimental"
- CRITICAL: Populate ALL strategic metadata fields (funnel_stage, kpi_hint, related_goal_stages, recommended_content_types, goal_indices, topic_indices, suggested_phase).
- CRITICAL FOR TOPICS: Every topic MUST include:
  * "related_goal_stages": non-empty array of funnel stages (e.g., ["awareness", "consideration"])
  * "recommended_content_types": non-empty array of content types (e.g., ["short_video", "static_image"])
  These fields are REQUIRED for execution readiness validation.

VALIDATION CHECKLIST - Before responding, verify your JSON includes:
✓ "goals" array with 3-5 items (each with funnel_stage and kpi_hint)
✓ "segments" array with 3-5 items  
✓ "topics" array with 4-7 items (REQUIRED - DO NOT SKIP)
  ✓ Each topic MUST have "related_goal_stages" array (non-empty, REQUIRED)
  ✓ Each topic MUST have "recommended_content_types" array (non-empty, REQUIRED)
✓ "narratives" array with 2-4 items (REQUIRED - DO NOT SKIP)
✓ "segment_topic_matrix" array with 10-25 entries (REQUIRED - DO NOT SKIP)
`
