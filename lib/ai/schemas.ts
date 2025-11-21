import { z } from 'zod'

export const GoalSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  target_metric: z.record(z.any()).optional(),
  priority: z.number().int().nonnegative(),
})

export const SegmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  demographics: z.record(z.any()).optional(),
  psychographics: z.record(z.any()).optional(),
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
  metadata: z.record(z.any()).optional(),
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
