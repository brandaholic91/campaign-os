import { 
  GoalSchema, 
  SegmentSchema, 
  TopicSchema, 
  NarrativeSchema, 
  SegmentTopicMatrixEntrySchema,
  CampaignStructureSchema
} from '@/lib/ai/schemas'
import { z } from 'zod'

// Type definitions based on Zod schemas
export type Goal = z.infer<typeof GoalSchema>
export type Segment = z.infer<typeof SegmentSchema>
export type Topic = z.infer<typeof TopicSchema>
export type Narrative = z.infer<typeof NarrativeSchema>
export type SegmentTopicMatrixEntry = z.infer<typeof SegmentTopicMatrixEntrySchema>
export type CampaignStructure = z.infer<typeof CampaignStructureSchema>

export type ValidationResult = {
  valid: boolean
  missing?: string[]
  violations?: Array<{ segment_id: string; issue: string }>
}

export type ExecutionReadinessResult = {
  ready: boolean
  issues: Array<{
    type: 'goal' | 'segment' | 'topic' | 'narrative' | 'matrix'
    element: string // element ID or name
    issue: string // clear description
  }>
}

/**
 * Validates if a goal has all required fields for execution
 */
export function validateGoalCompleteness(goal: Goal): ValidationResult {
  const missing: string[] = []

  if (!goal.funnel_stage) {
    missing.push('funnel_stage')
  }

  // kpi_hint is optional but recommended, strictly speaking for "completeness" 
  // in the context of execution readiness, we might want to flag it if missing,
  // but the AC says "optional, but recommended". 
  // Let's stick to the AC: "checks for: funnel_stage field presence, kpi_hint field presence (optional, but recommended)"
  // If it's recommended, maybe we don't fail validation but we could list it?
  // The AC says "function provides clear feedback on missing fields".
  // Let's include it in missing but maybe the valid flag depends on strict requirements.
  // For now, I'll treat funnel_stage as required for valid=true, and kpi_hint as just info if we wanted strictness.
  // However, the prompt implies these are the things to check. 
  // Let's make valid = true only if funnel_stage is present.
  
  if (!goal.kpi_hint) {
    missing.push('kpi_hint (recommended)')
  }

  return {
    valid: !!goal.funnel_stage,
    missing: missing.length > 0 ? missing : undefined
  }
}

/**
 * Validates if a segment has all required fields for execution
 */
export function validateSegmentCompleteness(segment: Segment): ValidationResult {
  const missing: string[] = []
  
  // Required fields from Epic 3.0.5
  if (!segment.demographic_profile) missing.push('demographic_profile')
  if (!segment.psychographic_profile) missing.push('psychographic_profile')
  if (!segment.media_habits) missing.push('media_habits')
  if (!segment.funnel_stage_focus) missing.push('funnel_stage_focus')
  if (!segment.example_persona) missing.push('example_persona')
  if (!segment.priority) missing.push('priority')

  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
  }
}

/**
 * Validates if a topic has all required fields for execution
 */
export function validateTopicCompleteness(topic: Topic): ValidationResult {
  const missing: string[] = []

  // Normalize to array if null/undefined
  const relatedGoalStages = Array.isArray(topic.related_goal_stages) 
    ? topic.related_goal_stages 
    : (topic.related_goal_stages ? [topic.related_goal_stages] : [])
  
  const recommendedContentTypes = Array.isArray(topic.recommended_content_types)
    ? topic.recommended_content_types
    : (topic.recommended_content_types ? [topic.recommended_content_types] : [])

  if (relatedGoalStages.length === 0) {
    missing.push('related_goal_stages')
  }

  if (recommendedContentTypes.length === 0) {
    missing.push('recommended_content_types (recommended)')
  }

  // related_goal_stages is required for validity
  return {
    valid: relatedGoalStages.length > 0,
    missing: missing.length > 0 ? missing : undefined
  }
}

/**
 * Validates if a narrative has all required fields for execution
 */
export function validateNarrativeCompleteness(narrative: Narrative): ValidationResult {
  const missing: string[] = []

  // All these are "optional, but recommended" in AC
  if (!narrative.primary_goal_ids || narrative.primary_goal_ids.length === 0) {
    missing.push('primary_goal_ids (recommended)')
  }
  
  if (!narrative.primary_topic_ids || narrative.primary_topic_ids.length === 0) {
    missing.push('primary_topic_ids (recommended)')
  }

  if (!narrative.suggested_phase) {
    missing.push('suggested_phase (recommended)')
  }

  // Since all are optional/recommended, is it valid even if empty?
  // Usually "completeness" implies having the recommended data for best results.
  // But strictly speaking, if they are optional in schema, maybe valid=true?
  // Let's assume for "Execution Readiness", we want these filled.
  // But I will be lenient on 'valid' flag if they are just recommended, 
  // OR I can make them required for the "Ready for Execution" state.
  // The AC says "checks for...". Let's assume valid=true if they are present.
  // Actually, if they are ALL missing, it's probably not a very useful narrative.
  // Let's mark valid=true even if missing, but return the missing fields.
  // Wait, AC 6 says "function validates: All narratives completeness".
  // If I return valid=true with missing fields, is it complete?
  // Let's stick to: valid if it has at least some content? 
  // No, let's just report missing fields. The 'valid' flag might be subjective here.
  // Let's say it's valid if it has a title and description (schema enforces this).
  // The specific fields checked here are extra.
  // Let's return valid=true but list missing.
  
  return {
    valid: true, // Schema enforces title/desc, these are recommended extras
    missing: missing.length > 0 ? missing : undefined
  }
}

/**
 * Validates matrix rules constraints
 */
export function validateMatrixRules(
  matrix: SegmentTopicMatrixEntry[], 
  segments: Segment[]
): ValidationResult {
  const violations: Array<{ segment_id: string; issue: string }> = []
  
  // Group by segment_id
  // Note: matrix entries might use segment_index if from AI, or segment_id if from DB.
  // We need to handle both or assume we are validating a saved structure with IDs.
  // The AC says "Given I have a campaign structure with segment-topic matrix".
  // Usually this validation runs on the DB structure.
  // Let's assume we can map them.
  
  // Helper to get segment ID from entry
  const getSegmentId = (entry: SegmentTopicMatrixEntry, segments: Segment[]): string | undefined => {
    if ('segment_id' in entry) return entry.segment_id
    if ('segment_index' in entry && segments[entry.segment_index]) {
      return segments[entry.segment_index].id || `index-${entry.segment_index}`
    }
    return undefined
  }

  const getSegmentName = (segmentId: string): string => {
    const seg = segments.find(s => s.id === segmentId)
    return seg?.name || 'Unknown Segment'
  }

  // Group entries
  const entriesBySegment: Record<string, SegmentTopicMatrixEntry[]> = {}
  
  matrix.forEach(entry => {
    const segId = getSegmentId(entry, segments)
    if (segId) {
      if (!entriesBySegment[segId]) {
        entriesBySegment[segId] = []
      }
      entriesBySegment[segId].push(entry)
    }
  })

  // Check rules per segment
  Object.entries(entriesBySegment).forEach(([segmentId, entries]) => {
    let highCoreCount = 0
    let mediumSupportCount = 0
    let experimentalCount = 0

    entries.forEach(entry => {
      if (entry.importance === 'high' && entry.role === 'core_message') {
        highCoreCount++
      }
      if (entry.importance === 'medium' && entry.role === 'support') {
        mediumSupportCount++
      }
      if (entry.role === 'experimental') {
        experimentalCount++
      }
    })

    const segmentName = getSegmentName(segmentId)

    // Rule: Max 2-3 high importance + core_message topics
    if (highCoreCount > 3) {
      violations.push({
        segment_id: segmentId,
        issue: `Segment "${segmentName}" has ${highCoreCount} High Importance/Core Message topics (max 3 recommended)`
      })
    }

    // Rule: Max 2-4 medium importance support topics
    if (mediumSupportCount > 4) {
      violations.push({
        segment_id: segmentId,
        issue: `Segment "${segmentName}" has ${mediumSupportCount} Medium Importance/Support topics (max 4 recommended)`
      })
    }

    // Rule: Max 1-2 experimental topics
    if (experimentalCount > 2) {
      violations.push({
        segment_id: segmentId,
        issue: `Segment "${segmentName}" has ${experimentalCount} Experimental topics (max 2 recommended)`
      })
    }
  })

  return {
    valid: violations.length === 0,
    violations: violations.length > 0 ? violations : undefined
  }
}

/**
 * Comprehensive check for execution readiness
 */
export function isReadyForExecution(structure: CampaignStructure): ExecutionReadinessResult {
  const issues: ExecutionReadinessResult['issues'] = []

  // 1. Validate Goals
  structure.goals.forEach((goal, index) => {
    const res = validateGoalCompleteness(goal)
    if (!res.valid || (res.missing && res.missing.length > 0)) {
      // If not valid, it's an issue. If valid but missing recommended, maybe just a warning?
      // Let's report all missing items as issues for readiness
      res.missing?.forEach(field => {
        issues.push({
          type: 'goal',
          element: goal.title || `Goal ${index + 1}`,
          issue: `Missing ${field}`
        })
      })
    }
  })

  // 2. Validate Segments
  structure.segments.forEach((segment, index) => {
    const res = validateSegmentCompleteness(segment)
    if (!res.valid || (res.missing && res.missing.length > 0)) {
      res.missing?.forEach(field => {
        issues.push({
          type: 'segment',
          element: segment.name || `Segment ${index + 1}`,
          issue: `Missing ${field}`
        })
      })
    }
  })

  // 3. Validate Topics
  if (structure.topics) {
    structure.topics.forEach((topic, index) => {
      const res = validateTopicCompleteness(topic)
      if (!res.valid || (res.missing && res.missing.length > 0)) {
        res.missing?.forEach(field => {
          issues.push({
            type: 'topic',
            element: topic.name || `Topic ${index + 1}`,
            issue: `Missing ${field}`
          })
        })
      }
    })
  }

  // 4. Validate Narratives (required: 2-4)
  if (!structure.narratives || structure.narratives.length === 0) {
    issues.push({
      type: 'narrative',
      element: 'Narratives',
      issue: 'Missing narratives array (required: 2-4 narratives)'
    })
  } else if (structure.narratives.length < 2) {
    issues.push({
      type: 'narrative',
      element: 'Narratives',
      issue: `Too few narratives: ${structure.narratives.length} (required: 2-4)`
    })
  } else if (structure.narratives.length > 4) {
    issues.push({
      type: 'narrative',
      element: 'Narratives',
      issue: `Too many narratives: ${structure.narratives.length} (required: 2-4)`
    })
  } else {
    structure.narratives.forEach((narrative, index) => {
      const res = validateNarrativeCompleteness(narrative)
      if (res.missing && res.missing.length > 0) {
        res.missing.forEach(field => {
          issues.push({
            type: 'narrative',
            element: narrative.title || `Narrative ${index + 1}`,
            issue: `Missing ${field}`
          })
        })
      }
    })
  }

  // 5. Validate Matrix Rules (required: 10-25 entries)
  if (!structure.segment_topic_matrix || structure.segment_topic_matrix.length === 0) {
    issues.push({
      type: 'matrix',
      element: 'Segment-Topic Matrix',
      issue: 'Missing segment_topic_matrix array (required: 10-25 entries)'
    })
  } else if (structure.segment_topic_matrix.length < 10) {
    issues.push({
      type: 'matrix',
      element: 'Segment-Topic Matrix',
      issue: `Too few matrix entries: ${structure.segment_topic_matrix.length} (required: 10-25)`
    })
  } else if (structure.segment_topic_matrix.length > 25) {
    issues.push({
      type: 'matrix',
      element: 'Segment-Topic Matrix',
      issue: `Too many matrix entries: ${structure.segment_topic_matrix.length} (required: 10-25)`
    })
  } else {
    const matrixRes = validateMatrixRules(structure.segment_topic_matrix, structure.segments)
    if (matrixRes.violations) {
      matrixRes.violations.forEach(v => {
        issues.push({
          type: 'matrix',
          element: v.segment_id, // We might want to resolve name here too if possible, but ID is what we have in violation
          issue: v.issue
        })
      })
    }
  }

  return {
    ready: issues.length === 0,
    issues
  }
}
