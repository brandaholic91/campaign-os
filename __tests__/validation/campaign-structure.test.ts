import {
  validateGoalCompleteness,
  validateSegmentCompleteness,
  validateTopicCompleteness,
  validateNarrativeCompleteness,
  validateMatrixRules,
  isReadyForExecution,
  Goal,
  Segment,
  Topic,
  Narrative,
  SegmentTopicMatrixEntry,
  CampaignStructure
} from '@/lib/validation/campaign-structure'

describe('Campaign Structure Validation', () => {
  
  describe('validateGoalCompleteness', () => {
    it('should return valid for a complete goal', () => {
      const goal: Goal = {
        title: 'Test Goal',
        priority: 1,
        funnel_stage: 'awareness',
        kpi_hint: 'Reach 1000 people'
      }
      const result = validateGoalCompleteness(goal)
      expect(result.valid).toBe(true)
      expect(result.missing).toBeUndefined()
    })

    it('should return invalid if funnel_stage is missing', () => {
      const goal: Goal = {
        title: 'Test Goal',
        priority: 1
      }
      const result = validateGoalCompleteness(goal)
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('funnel_stage')
    })

    it('should report missing kpi_hint but remain valid', () => {
      const goal: Goal = {
        title: 'Test Goal',
        priority: 1,
        funnel_stage: 'awareness'
      }
      const result = validateGoalCompleteness(goal)
      expect(result.valid).toBe(true)
      expect(result.missing).toContain('kpi_hint (recommended)')
    })
  })

  describe('validateSegmentCompleteness', () => {
    const validSegment: Segment = {
      name: 'Test Segment',
      priority: 'primary',
      demographic_profile: { age_range: '18-25', location_type: 'Urban' },
      psychographic_profile: { values: [], attitudes_to_campaign_topic: [], motivations: [], pain_points: [] },
      media_habits: { primary_channels: [] },
      funnel_stage_focus: 'awareness',
      example_persona: { name: 'Persona', one_sentence_story: 'Story' }
    }

    it('should return valid for a complete segment', () => {
      const result = validateSegmentCompleteness(validSegment)
      expect(result.valid).toBe(true)
      expect(result.missing).toBeUndefined()
    })

    it('should return invalid if required fields are missing', () => {
      const segment: Segment = {
        name: 'Incomplete Segment',
        priority: 'secondary'
      }
      const result = validateSegmentCompleteness(segment)
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('demographic_profile')
      expect(result.missing).toContain('psychographic_profile')
      expect(result.missing).toContain('media_habits')
      expect(result.missing).toContain('funnel_stage_focus')
      expect(result.missing).toContain('example_persona')
    })
  })

  describe('validateTopicCompleteness', () => {
    it('should return valid for a complete topic', () => {
      const topic: Topic = {
        name: 'Test Topic',
        priority: 'primary',
        related_goal_stages: ['awareness'],
        recommended_content_types: ['blog'],
        risk_notes: []
      }
      const result = validateTopicCompleteness(topic)
      expect(result.valid).toBe(true)
      expect(result.missing).toBeUndefined()
    })

    it('should return invalid if related_goal_stages is missing', () => {
      const topic: Topic = {
        name: 'Test Topic',
        priority: 'primary',
        risk_notes: []
      }
      const result = validateTopicCompleteness(topic)
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('related_goal_stages')
    })
  })

  describe('validateNarrativeCompleteness', () => {
    it('should return valid for a complete narrative', () => {
      const narrative: Narrative = {
        title: 'Test Narrative',
        description: 'Desc',
        primary_goal_ids: ['goal-1'],
        primary_topic_ids: ['topic-1'],
        suggested_phase: 'early'
      }
      const result = validateNarrativeCompleteness(narrative)
      expect(result.valid).toBe(true)
      expect(result.missing).toBeUndefined()
    })

    it('should return valid but report missing recommended fields', () => {
      const narrative: Narrative = {
        title: 'Test Narrative',
        description: 'Desc'
      }
      const result = validateNarrativeCompleteness(narrative)
      expect(result.valid).toBe(true)
      expect(result.missing).toContain('primary_goal_ids (recommended)')
      expect(result.missing).toContain('primary_topic_ids (recommended)')
      expect(result.missing).toContain('suggested_phase (recommended)')
    })
  })

  describe('validateMatrixRules', () => {
    const segments: Segment[] = [
      { id: 'seg-1', name: 'Segment 1', priority: 'primary' } as Segment
    ]

    it('should return valid for compliant matrix', () => {
      const matrix: SegmentTopicMatrixEntry[] = [
        { segment_id: 'seg-1', topic_id: 't1', importance: 'high', role: 'core_message' },
        { segment_id: 'seg-1', topic_id: 't2', importance: 'high', role: 'core_message' },
        { segment_id: 'seg-1', topic_id: 't3', importance: 'medium', role: 'support' }
      ]
      const result = validateMatrixRules(matrix, segments)
      expect(result.valid).toBe(true)
      expect(result.violations).toBeUndefined()
    })

    it('should detect too many high/core topics', () => {
      const matrix: SegmentTopicMatrixEntry[] = [
        { segment_id: 'seg-1', topic_id: 't1', importance: 'high', role: 'core_message' },
        { segment_id: 'seg-1', topic_id: 't2', importance: 'high', role: 'core_message' },
        { segment_id: 'seg-1', topic_id: 't3', importance: 'high', role: 'core_message' },
        { segment_id: 'seg-1', topic_id: 't4', importance: 'high', role: 'core_message' } // 4th one
      ]
      const result = validateMatrixRules(matrix, segments)
      expect(result.valid).toBe(false)
      expect(result.violations?.[0].issue).toContain('max 3 recommended')
    })
  })

  describe('isReadyForExecution', () => {
    it('should return ready for a complete structure', () => {
      const structure: CampaignStructure = {
        goals: [
          { title: 'G1', priority: 1, funnel_stage: 'awareness', kpi_hint: 'KPI' },
          { title: 'G2', priority: 2, funnel_stage: 'engagement', kpi_hint: 'KPI' },
          { title: 'G3', priority: 3, funnel_stage: 'conversion', kpi_hint: 'KPI' }
        ],
        segments: [{
          id: 'seg-1', name: 'S1', priority: 'primary',
          demographic_profile: { age_range: '18-25', location_type: 'Urban' },
          psychographic_profile: { values: [], attitudes_to_campaign_topic: [], motivations: [], pain_points: [] },
          media_habits: { primary_channels: [] },
          funnel_stage_focus: 'awareness',
          example_persona: { name: 'P1', one_sentence_story: 'S' }
        }],
        topics: [{ name: 'T1', priority: 'primary', related_goal_stages: ['awareness'], recommended_content_types: ['blog'], risk_notes: [] }],
        narratives: [
          {
            title: 'N1',
            description: 'Desc 1',
            priority: 1,
            primary_goal_ids: ['g1'],
            primary_topic_ids: ['t1'],
            suggested_phase: 'early'
          },
          {
            title: 'N2',
            description: 'Desc 2',
            priority: 2,
            primary_goal_ids: ['g2'],
            primary_topic_ids: ['t1'],
            suggested_phase: 'mid'
          }
        ],
        segment_topic_matrix: [
          // Minimum 10 required, but max 3 high/core per segment
          { segment_id: 'seg-1', topic_id: 't1', importance: 'high', role: 'core_message' },
          { segment_id: 'seg-1', topic_id: 't2', importance: 'high', role: 'core_message' },
          { segment_id: 'seg-1', topic_id: 't3', importance: 'high', role: 'core_message' },
          { segment_id: 'seg-1', topic_id: 't4', importance: 'medium', role: 'support' },
          { segment_id: 'seg-1', topic_id: 't5', importance: 'medium', role: 'support' },
          { segment_id: 'seg-1', topic_id: 't6', importance: 'medium', role: 'support' },
          { segment_id: 'seg-1', topic_id: 't7', importance: 'low', role: 'experimental' },
          { segment_id: 'seg-1', topic_id: 't8', importance: 'low', role: 'experimental' },
          { segment_id: 'seg-1', topic_id: 't9', importance: 'low', role: 'support' },
          { segment_id: 'seg-1', topic_id: 't10', importance: 'low', role: 'support' }
        ]
      }
      const result = isReadyForExecution(structure)
      expect(result.ready).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should aggregate issues from all validations', () => {
      const structure: CampaignStructure = {
        goals: [{ title: 'G1', priority: 1 }], // Missing funnel_stage
        segments: [{ name: 'S1', priority: 'primary' }], // Missing profile fields
        topics: [{ name: 'T1', priority: 'primary', risk_notes: [] }], // Missing related_goal_stages
        narratives: [],
        segment_topic_matrix: []
      }
      const result = isReadyForExecution(structure)
      expect(result.ready).toBe(false)
      expect(result.issues.some(i => i.type === 'goal')).toBe(true)
      expect(result.issues.some(i => i.type === 'segment')).toBe(true)
      expect(result.issues.some(i => i.type === 'topic')).toBe(true)
    })
  })
})
