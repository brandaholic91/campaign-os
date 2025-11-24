import { z } from 'zod'

// Helper to create flexible array schemas that handle AI output inconsistencies
// Handles: undefined → [], nested arrays → flattened, mixed types
const flexibleStringArray = () => z.preprocess((val) => {
  if (!val) return []
  if (Array.isArray(val)) {
    // Flatten nested arrays and filter to strings only
    return val.flatMap(item => 
      Array.isArray(item) ? item.filter(v => typeof v === 'string') : 
      typeof item === 'string' ? [item] : []
    )
  }
  if (typeof val === 'string') return [val]
  return []
}, z.array(z.string()))

export const GoalSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  target_metric: z.record(z.string(), z.any()).optional(),
  priority: z.number().int().min(1).max(3), // Only 1, 2, or 3 allowed
  funnel_stage: z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization']).optional(),
  kpi_hint: z.string().optional(),
})

export const DemographicProfileSchema = z.object({
  age_range: z.string(),
  location_type: z.string(),
  income_level: z.string().optional(),
  other_demographics: z.string().optional(),
})

export const PsychographicProfileSchema = z.object({
  values: flexibleStringArray(),
  attitudes_to_campaign_topic: flexibleStringArray(),
  motivations: flexibleStringArray(),
  pain_points: flexibleStringArray(),
})

export const MediaHabitsSchema = z.object({
  primary_channels: flexibleStringArray(),
  secondary_channels: flexibleStringArray().optional(),
  notes: z.string().optional(),
})

export const ExamplePersonaSchema = z.object({
  name: z.string(),
  one_sentence_story: z.string(),
})

export const SegmentSchema = z.object({
  id: z.string().optional(), // Optional for new segments before saving
  name: z.string(),
  short_label: z.string().optional(),
  description: z.string().optional(),
  demographic_profile: DemographicProfileSchema.optional(),
  psychographic_profile: PsychographicProfileSchema.optional(),
  media_habits: MediaHabitsSchema.optional(),
  funnel_stage_focus: z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization']).optional(),
  example_persona: ExamplePersonaSchema.optional(),
  priority: z.enum(['primary', 'secondary']).default('secondary'),
  // Legacy fields for backward compatibility
  demographics: z.record(z.string(), z.any()).optional(),
  psychographics: z.record(z.string(), z.any()).optional(),
})

export const TopicSchema = z.object({
  id: z.string().optional(), // Optional for new topics before saving
  name: z.string(),
  short_label: z.string().optional(),
  description: z.string().optional(),
  topic_type: z.enum(['benefit', 'problem', 'value', 'proof', 'story']).optional(),
  related_goal_types: flexibleStringArray().optional(),
  core_narrative: z.string().optional(),
  content_angles: flexibleStringArray().optional(),
  recommended_channels: flexibleStringArray().optional(),
  risk_notes: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
    if (typeof val === 'string') {
      return val.trim() ? [val] : []
    }
    return val
  }),
  priority: z.enum(['primary', 'secondary']).default('secondary'),
  category: z.string().optional(), // Legacy field
  related_goal_stages: z.array(z.enum(['awareness', 'engagement', 'consideration', 'conversion', 'mobilization'])).optional(),
  recommended_content_types: flexibleStringArray().optional(),
})

// Schema for segment-topic matrix with indices (from AI generation)
export const SegmentTopicMatrixEntryWithIndicesSchema = z.object({
  segment_index: z.number().int().nonnegative(),
  topic_index: z.number().int().nonnegative(),
  importance: z.enum(['high', 'medium', 'low']),
  role: z.enum(['core_message', 'support', 'experimental']),
  summary: z.string().max(500).optional(),
})

// Schema for segment-topic matrix with IDs (for database)
export const SegmentTopicMatrixSchema = z.object({
  segment_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  importance: z.enum(['high', 'medium', 'low']),
  role: z.enum(['core_message', 'support', 'experimental']),
  summary: z.string().max(500).optional(),
})

// Preprocess to normalize the data before validation
const preprocessMatrixEntry = (data: unknown) => {
  if (typeof data !== 'object' || data === null) return data
  
  const entry = data as Record<string, unknown>
  
  // Normalize importance to lowercase if it's a string
  if (entry.importance && typeof entry.importance === 'string') {
    const normalized = entry.importance.toLowerCase()
    if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
      entry.importance = normalized
    }
  }
  
  // Normalize role to lowercase if it's a string
  if (entry.role && typeof entry.role === 'string') {
    const normalized = entry.role.toLowerCase()
    if (normalized === 'core_message' || normalized === 'support' || normalized === 'experimental') {
      entry.role = normalized
    }
  }
  
  // If it has segment_index and topic_index, it's index-based format
  if (('segment_index' in entry && typeof entry.segment_index === 'number') && 
      ('topic_index' in entry && typeof entry.topic_index === 'number')) {
    return {
      segment_index: Number(entry.segment_index),
      topic_index: Number(entry.topic_index),
      importance: entry.importance,
      role: entry.role,
      summary: entry.summary,
    }
  }
  
  // If it has segment_id and topic_id, it's ID-based format
  if (('segment_id' in entry && typeof entry.segment_id === 'string') && 
      ('topic_id' in entry && typeof entry.topic_id === 'string')) {
    return {
      segment_id: entry.segment_id,
      topic_id: entry.topic_id,
      importance: entry.importance,
      role: entry.role,
      summary: entry.summary,
    }
  }
  
  // Return as-is if neither format matches (will fail validation)
  return data
}

// Union schema that accepts both formats with preprocessing
export const SegmentTopicMatrixEntrySchema = z.preprocess(
  preprocessMatrixEntry,
  z.union([
    SegmentTopicMatrixEntryWithIndicesSchema,
    SegmentTopicMatrixSchema,
  ])
)

export const NarrativeSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new narratives before saving
  title: z.string(),
  description: z.string(),
  priority: z.number().int().nonnegative().optional(),
  primary_goal_ids: z.array(z.string().uuid()).optional(),
  primary_topic_ids: z.array(z.string().uuid()).optional(),
  goal_indices: z.array(z.number().int().nonnegative()).optional(), // For AI generation to link to new goals
  topic_indices: z.array(z.number().int().nonnegative()).optional(), // For AI generation to link to new topics
  suggested_phase: z.enum(['early', 'mid', 'late']).optional(),
})

export const CampaignStructureSchema = z.object({
  goals: z.array(GoalSchema).min(3, 'At least 3 goals required').max(5, 'Maximum 5 goals allowed'),
  segments: z.array(SegmentSchema),
  topics: z.array(TopicSchema).optional(), // Optional in schema to handle AI generation issues, but validated separately
  narratives: z.array(NarrativeSchema).min(2, 'At least 2 narratives required').max(4, 'Maximum 4 narratives allowed').optional(), // Optional in schema to handle AI generation issues, but validated separately
  segment_topic_matrix: z.array(SegmentTopicMatrixEntrySchema).min(10, 'At least 10 matrix entries required').max(25, 'Maximum 25 matrix entries allowed').optional(), // Optional in schema to handle AI generation issues, but validated separately
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
  supporting_messages: flexibleStringArray().refine(arr => arr.length >= 3 && arr.length <= 5, { message: "Must have 3-5 items" }),
  proof_points: flexibleStringArray().refine(arr => arr.length >= 2 && arr.length <= 3, { message: "Must have 2-3 items" }),
  objections_reframes: flexibleStringArray().optional(),
})

export const StyleToneSchema = z.object({
  tone_profile: z.object({
    description: z.string(),
    keywords: flexibleStringArray().refine(arr => arr.length >= 3 && arr.length <= 5, { message: "Must have 3-5 keywords" }),
  }),
  language_style: z.string(),
  communication_guidelines: z.object({
    do: flexibleStringArray(),
    dont: flexibleStringArray(),
  }),
  emotional_temperature: z.string(),
})

export const CTAFunnelSchema = z.object({
  funnel_stage: z.enum(['awareness', 'consideration', 'conversion', 'mobilization']),
  cta_objectives: flexibleStringArray(),
  cta_patterns: flexibleStringArray().refine(arr => arr.length >= 2 && arr.length <= 3, { message: "Must have 2-3 patterns" }),
  friction_reducers: flexibleStringArray().optional(),
})

export const ExtraFieldsSchema = z.object({
  framing_type: z.string().optional(),
  key_phrases: flexibleStringArray().optional(),
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
