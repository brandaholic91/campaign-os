import { BriefNormalizerOutputSchema, CampaignStructureSchema } from '@/lib/ai/schemas'
import { BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'

describe('AI Campaign Generation', () => {
  describe('Schemas', () => {
    it('should validate valid BriefNormalizer output', () => {
      const validOutput = {
        campaign_type: 'brand_awareness',
        goal_type: 'awareness',
        key_themes: ['sustainability', 'innovation'],
        target_audience_summary: 'Young professionals interested in eco-friendly products',
        primary_message: 'The future is green'
      }
      const result = BriefNormalizerOutputSchema.safeParse(validOutput)
      expect(result.success).toBe(true)
    })

    it('should validate valid CampaignStructure output', () => {
      const validStructure = {
        goals: [{ title: 'Goal 1', description: 'Desc 1', priority: 1 }],
        segments: [{ name: 'Segment 1', description: 'Desc 1', priority: 1 }],
        topics: [{ name: 'Topic 1', description: 'Desc 1' }],
        narratives: [{ title: 'Narrative 1', description: 'Desc 1', priority: 1 }]
      }
      const result = CampaignStructureSchema.safeParse(validStructure)
      expect(result.success).toBe(true)
    })
  })

  describe('Prompts', () => {
    it('should generate Brief Normalizer prompt with context', () => {
      const prompt = BRIEF_NORMALIZER_USER_PROMPT('My brief', 'brand_awareness', 'awareness')
      expect(prompt).toContain('My brief')
      expect(prompt).toContain('Explicit Campaign Type: brand_awareness')
      expect(prompt).toContain('Explicit Goal Type: awareness')
    })

    it('should generate Strategy Designer prompt with normalized data', () => {
      const normalizedData = {
        campaign_type: 'brand_awareness',
        goal_type: 'awareness',
        key_themes: ['theme1'],
        target_audience_summary: 'audience',
        primary_message: 'message'
      } as any
      
      const prompt = STRATEGY_DESIGNER_USER_PROMPT(normalizedData)
      expect(prompt).toContain('Campaign Type: brand_awareness')
      expect(prompt).toContain('Primary Message: message')
    })
  })
})
