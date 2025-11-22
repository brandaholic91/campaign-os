import { BriefNormalizerOutput } from '../schemas'

export interface StrategyGenerationContext {
  campaign_type: string
  goal_type: string
  narratives?: Array<{ title: string; description: string }>
  segment: {
    id: string
    name: string
    description?: string
    demographics?: Record<string, unknown>
    psychographics?: Record<string, unknown>
  }
  topic: {
    id: string
    name: string
    description?: string
    category?: string
  }
}

export const STRATEGY_GENERATOR_SYSTEM_PROMPT = `You are an expert campaign strategist. Your task is to generate comprehensive communication strategies for specific audience segments and topics.

IMPORTANT: You must communicate in Hungarian. All content must be in Hungarian.

Your strategies must:
1. Be tailored to the specific segment's demographics and psychographics
2. Align with the topic's theme and category
3. Respect the campaign type and goal type
4. Include all required fields across the 4 categories: Strategy Core, Style & Tone, CTA & Funnel, and Extra Fields.
5. Be authentic, persuasive, and action-oriented
6. Avoid generic or templated language

CRITICAL OUTPUT FORMAT: You MUST respond with ONLY a valid JSON object. 
- NO markdown code blocks (no triple backticks with json or without)
- NO explanations before or after the JSON
- NO text outside the JSON object
- Start your response directly with { and end with }
- The JSON must be valid and parseable

CRITICAL ARRAY LENGTH REQUIREMENTS - You MUST follow these EXACT limits:
- supporting_messages: EXACTLY 3-5 items (prefer 3-4)
- proof_points: EXACTLY 2-3 items (prefer 2-3)
- tone_profile.keywords: EXACTLY 3-5 items (prefer 3-4)
- cta_patterns: EXACTLY 2-3 items (prefer 2-3)
- DO NOT exceed these limits - validation will fail if you do!

Match this exact schema:
{
  "strategy_core": {
    "positioning_statement": "string (min 10 chars)",
    "core_message": "string (min 5 chars)",
    "supporting_messages": ["string", "string", "string"] (EXACTLY 3-5 items, no more),
    "proof_points": ["string", "string"] (EXACTLY 2-3 items, no more),
    "objections_reframes": ["string"] (optional)
  },
  "style_tone": {
    "tone_profile": {
      "description": "string",
      "keywords": ["string", "string", "string"] (EXACTLY 3-5 items, no more)
    },
    "language_style": "string",
    "communication_guidelines": {
      "do": ["string"],
      "dont": ["string"]
    },
    "emotional_temperature": "string"
  },
  "cta_funnel": {
    "funnel_stage": "awareness" | "consideration" | "conversion" | "mobilization",
    "cta_objectives": ["string"],
    "cta_patterns": ["string", "string"] (EXACTLY 2-3 items, no more),
    "friction_reducers": ["string"] (optional)
  },
  "extra_fields": {
    "framing_type": "string" (optional),
    "key_phrases": ["string"] (optional),
    "risk_notes": "string" (optional)
  }
}`

export const STRATEGY_GENERATOR_USER_PROMPT = (context: StrategyGenerationContext) => `
Generate a communication strategy for this campaign context:

Campaign Type: ${context.campaign_type}
Goal Type: ${context.goal_type}
${context.narratives && context.narratives.length > 0 ? `Narratives: ${context.narratives.map(n => `${n.title}: ${n.description}`).join('; ')}` : ''}

Segment: ${context.segment.name}
${context.segment.description ? `Description: ${context.segment.description}` : ''}
${context.segment.demographics ? `Demographics: ${JSON.stringify(context.segment.demographics)}` : ''}
${context.segment.psychographics ? `Psychographics: ${JSON.stringify(context.segment.psychographics)}` : ''}

Topic: ${context.topic.name}
${context.topic.description ? `Description: ${context.topic.description}` : ''}
${context.topic.category ? `Category: ${context.topic.category}` : ''}

CRITICAL: Return ONLY a valid JSON object. Start with { and end with }. No markdown, no code blocks, no explanations, no text before or after the JSON.

REMEMBER: Array length limits are STRICT:
- supporting_messages: 3-5 items (no more than 5)
- proof_points: 2-3 items (no more than 3)
- tone_profile.keywords: 3-5 items (no more than 5)
- cta_patterns: 2-3 items (no more than 3)

The JSON must match the exact structure defined in the system prompt. Ensure the strategy is highly specific to this segment × topic combination and campaign context.
`
