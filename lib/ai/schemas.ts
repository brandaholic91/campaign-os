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

export const CampaignStructureSchema = z.object({
  goals: z.array(GoalSchema),
  segments: z.array(SegmentSchema),
  topics: z.array(TopicSchema),
  narratives: z.array(z.string()),
})

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

export const AgentResponseSchema = z.object({
  type: z.enum(['user_message', 'agent_message', 'tool_call', 'state_patch', 'error']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
})

export type CampaignStructure = z.infer<typeof CampaignStructureSchema>
export type MessageMatrix = z.infer<typeof MessageMatrixSchema>

export function validateCampaignStructure(data: unknown): CampaignStructure {
  return CampaignStructureSchema.parse(data)
}

export function validateAgentResponse(data: unknown) {
  return AgentResponseSchema.parse(data)
}

export function safeValidateCampaignStructure(data: unknown) {
  return CampaignStructureSchema.safeParse(data)
}

