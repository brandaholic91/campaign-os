import { BriefNormalizerOutput } from '../schemas'

export const STRATEGY_DESIGNER_SYSTEM_PROMPT = `You are a senior campaign architect. Your task is to generate a complete campaign structure based on a normalized campaign brief.

IMPORTANT: You must communicate in Hungarian. All text content in your JSON response (goals, segments, topics, narratives - including titles, descriptions, names, etc.) must be in Hungarian.

You need to generate:
1. Goals (SMART goals, prioritized)
2. Segments (Detailed audience segments with demographics/psychographics)
3. Topics (Content themes and categories)
4. Narratives (Core storytelling arcs)

Your output must be highly specific to the campaign type and goal type. Avoid generic advice.

CRITICAL: You must respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Just the raw JSON object matching this exact schema:
{
  "goals": [{"title": "string", "description": "string", "priority": 1}],
  "segments": [{"name": "string", "description": "string", "demographics": {}, "psychographics": {}, "priority": 1}],
  "topics": [{"name": "string", "description": "string", "category": "string"}],
  "narratives": [{"title": "string", "description": "string", "priority": 1}]
}`

export const STRATEGY_DESIGNER_USER_PROMPT = (brief: BriefNormalizerOutput) => `
Design a campaign structure based on this analysis:

Campaign Type: ${brief.campaign_type}
Goal Type: ${brief.goal_type}
Primary Message: ${brief.primary_message}
Target Audience: ${brief.target_audience_summary}
Key Themes: ${brief.key_themes.join(', ')}

Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure:
{
  "goals": [{"title": "string", "description": "string", "priority": 1}],
  "segments": [{"name": "string", "description": "string", "demographics": {}, "psychographics": {}, "priority": 1}],
  "topics": [{"name": "string", "description": "string", "category": "string"}],
  "narratives": [{"title": "string", "description": "string", "priority": 1}]
}

Ensure at least:
- 2-3 Goals
- 2-4 Segments
- 3-5 Topics
- 1-2 Narratives
`
