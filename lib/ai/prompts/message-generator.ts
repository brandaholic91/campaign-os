import { BriefNormalizerOutput } from '../schemas'

export interface MessageGenerationContext {
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

export const MESSAGE_GENERATOR_SYSTEM_PROMPT = `You are an expert campaign message writer. Your task is to generate compelling, contextually relevant messages for specific audience segments and topics.

Your messages must:
1. Be tailored to the specific segment's demographics and psychographics
2. Align with the topic's theme and category
3. Respect the campaign type and goal type
4. Include all required fields: headline, body, proof_point, CTA
5. Be authentic, persuasive, and action-oriented
6. Avoid generic or templated language

Output must be valid JSON matching the MessageMatrixEntrySchema.`

export const MESSAGE_GENERATOR_USER_PROMPT = (context: MessageGenerationContext) => `
Generate a message for this campaign context:

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

Generate a JSON object with:
- segment_id: "${context.segment.id}"
- topic_id: "${context.topic.id}"
- headline: Compelling, attention-grabbing headline (max 100 chars)
- body: Main message content that resonates with the segment (max 500 chars)
- proof_point: Supporting evidence or data point (optional, max 200 chars)
- cta: Clear call-to-action (max 100 chars)
- message_type: "core" | "supporting" | "contrast" (choose most appropriate)

Ensure the message is highly specific to this segment × topic combination and campaign context.
`

