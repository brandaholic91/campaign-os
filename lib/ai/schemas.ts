import { z } from 'zod'

export const GoalSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  target_metric: z.record(z.string(), z.any()).optional(),
  priority: z.number().int().nonnegative(),
})

export const SegmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  demographics: z.record(z.string(), z.any()).optional(),
  psychographics: z.record(z.string(), z.any()).optional(),
  priority: z.number().int().nonnegative(),
})

export const TopicSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
})

export const NarrativeSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.number().int().nonnegative().optional(),
})

export const CampaignStructureSchema = z.object({
  goals: z.array(GoalSchema),
  segments: z.array(SegmentSchema),
  topics: z.array(TopicSchema),
  narratives: z.array(NarrativeSchema),
})

export const BriefNormalizerOutputSchema = z.object({
  campaign_type: z.enum(['political_election', 'political_issue', 'brand_awareness', 'product_launch', 'promo', 'ngo_issue']),
  goal_type: z.enum(['awareness', 'engagement', 'list_building', 'conversion', 'mobilization']),
  key_themes: z.array(z.string()),
  target_audience_summary: z.string(),
  primary_message: z.string(),
})

export type BriefNormalizerOutput = z.infer<typeof BriefNormalizerOutputSchema>

export const MessageMatrixEntrySchema = z.object({
  segment_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  headline: z.string(),
  body: z.string(),
  proof_point: z.string().optional(),
  cta: z.string().optional(),
  message_type: z.enum(['core', 'supporting', 'contrast']),
})

export const MessageMatrixSchema = z.array(MessageMatrixEntrySchema)

// Schema for message generation API input
export const MessageGenerationRequestSchema = z.object({
  campaign_id: z.string().uuid(),
  segment_ids: z.array(z.string().uuid()),
  topic_ids: z.array(z.string().uuid()),
  regenerate_combinations: z.array(z.string()).optional(), // Format: ["segment_id:topic_id", ...]
})

// Schema for single message generation output
export const GeneratedMessageSchema = MessageMatrixEntrySchema.extend({
  campaign_id: z.string().uuid(),
})

// Schema for batch message generation output
export const GeneratedMessagesSchema = z.array(GeneratedMessageSchema)

export const AgentResponseSchema = z.object({
  type: z.enum(['user_message', 'agent_message', 'tool_call', 'state_patch', 'error']),
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type CampaignStructure = z.infer<typeof CampaignStructureSchema>
export type MessageMatrix = z.infer<typeof MessageMatrixSchema>
export type MessageMatrixEntry = z.infer<typeof MessageMatrixEntrySchema>
export type GeneratedMessage = z.infer<typeof GeneratedMessageSchema>
export type MessageGenerationRequest = z.infer<typeof MessageGenerationRequestSchema>

export function validateCampaignStructure(data: unknown): CampaignStructure {
  return CampaignStructureSchema.parse(data)
}

export function validateAgentResponse(data: unknown) {
  return AgentResponseSchema.parse(data)
}

export function safeValidateCampaignStructure(data: unknown) {
  return CampaignStructureSchema.safeParse(data)
}

export function validateMessageMatrixEntry(data: unknown): MessageMatrixEntry {
  return MessageMatrixEntrySchema.parse(data)
}

export function validateGeneratedMessage(data: unknown): GeneratedMessage {
  return GeneratedMessageSchema.parse(data)
}

export function validateGeneratedMessages(data: unknown): GeneratedMessage[] {
  return GeneratedMessagesSchema.parse(data)
}

// Epic 3.0: Message Strategy Schemas

export const StrategyCoreSchema = z.object({
  positioning_statement: z.string().min(10),
  core_message: z.string().min(5),
  supporting_messages: z.array(z.string()).min(3).max(5),
  proof_points: z.array(z.string()).min(2).max(3),
  objections_reframes: z.array(z.string()).optional(),
})

export const StyleToneSchema = z.object({
  tone_profile: z.object({
    description: z.string(),
    keywords: z.array(z.string()).min(3).max(5),
  }),
  language_style: z.string(),
  communication_guidelines: z.object({
    do: z.array(z.string()),
    dont: z.array(z.string()),
  }),
  emotional_temperature: z.string(),
})

export const CTAFunnelSchema = z.object({
  funnel_stage: z.enum(['awareness', 'consideration', 'conversion', 'mobilization']),
  cta_objectives: z.array(z.string()),
  cta_patterns: z.array(z.string()).min(2).max(3),
  friction_reducers: z.array(z.string()).optional(),
})

export const ExtraFieldsSchema = z.object({
  framing_type: z.string().optional(),
  key_phrases: z.array(z.string()).optional(),
  risk_notes: z.string().optional(),
})

export const MessageStrategySchema = z.object({
  strategy_core: StrategyCoreSchema,
  style_tone: StyleToneSchema,
  cta_funnel: CTAFunnelSchema,
  extra_fields: ExtraFieldsSchema.optional(),
  preview_summary: z.string().optional(),
})

export type StrategyCore = z.infer<typeof StrategyCoreSchema>
export type StyleTone = z.infer<typeof StyleToneSchema>
export type CTAFunnel = z.infer<typeof CTAFunnelSchema>
export type ExtraFields = z.infer<typeof ExtraFieldsSchema>
export type MessageStrategy = z.infer<typeof MessageStrategySchema>
