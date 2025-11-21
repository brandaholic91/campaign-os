import { BriefNormalizerOutput } from '../schemas'

export const STRATEGY_DESIGNER_SYSTEM_PROMPT = `You are a senior campaign architect. Your task is to generate a complete campaign structure based on a normalized campaign brief.

You need to generate:
1. Goals (SMART goals, prioritized)
2. Segments (Detailed audience segments with demographics/psychographics)
3. Topics (Content themes and categories)
4. Narratives (Core storytelling arcs)

Your output must be highly specific to the campaign type and goal type. Avoid generic advice.
Output must be valid JSON matching the CampaignStructureSchema.`

export const STRATEGY_DESIGNER_USER_PROMPT = (brief: BriefNormalizerOutput) => `
Design a campaign structure based on this analysis:

Campaign Type: ${brief.campaign_type}
Goal Type: ${brief.goal_type}
Primary Message: ${brief.primary_message}
Target Audience: ${brief.target_audience_summary}
Key Themes: ${brief.key_themes.join(', ')}

Generate a JSON object with:
- goals: Array of { title, description, priority (1-5) }
- segments: Array of { name, description, demographics (object), psychographics (object), priority (1-5) }
- topics: Array of { name, description, category }
- narratives: Array of { title, description, priority (1-5) }

Ensure at least:
- 2-3 Goals
- 2-4 Segments
- 3-5 Topics
- 1-2 Narratives
`
