'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { ExecutionReadinessResult } from '@/lib/validation/campaign-structure'
import type { CampaignStructure } from '@/lib/validation/campaign-structure'

interface CompactExecutionReadinessChecklistProps {
  campaignId: string
  structure: CampaignStructure
  validationStatus: ExecutionReadinessResult
}

export function CompactExecutionReadinessChecklist({
  campaignId,
  structure,
  validationStatus,
}: CompactExecutionReadinessChecklistProps) {
  // Calculate progress
  const totalCriteria = 
    structure.goals.length +
    structure.segments.length +
    (structure.topics?.length || 0) +
    (structure.narratives?.length || 0) +
    (structure.segment_topic_matrix && structure.segment_topic_matrix.length > 0 ? 1 : 0)

  const issuesByType = {
    goal: validationStatus.issues.filter(i => i.type === 'goal'),
    segment: validationStatus.issues.filter(i => i.type === 'segment'),
    topic: validationStatus.issues.filter(i => i.type === 'topic'),
    narrative: validationStatus.issues.filter(i => i.type === 'narrative'),
    matrix: validationStatus.issues.filter(i => i.type === 'matrix'),
  }

  const completeCriteria = totalCriteria - validationStatus.issues.length
  const progressPercentage = totalCriteria > 0 ? Math.round((completeCriteria / totalCriteria) * 100) : 100

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Végrehajtásra Kész</h3>
        <Badge 
          variant={validationStatus.ready ? 'default' : 'destructive'}
          className={`text-xs ${validationStatus.ready ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {validationStatus.ready ? 'Kész' : 'Nem Kész'}
        </Badge>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">Előrehaladás</span>
          <span className="font-medium text-gray-700">{completeCriteria}/{totalCriteria} ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              validationStatus.ready ? 'bg-green-600' : 'bg-yellow-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {/* Goals */}
        <div className="flex items-center gap-1.5 text-xs">
          {issuesByType.goal.length === 0 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
          )}
          <span className="text-gray-600 truncate">Célok</span>
          <span className="text-gray-400">({structure.goals.length - issuesByType.goal.length}/{structure.goals.length})</span>
        </div>

        {/* Segments */}
        <div className="flex items-center gap-1.5 text-xs">
          {issuesByType.segment.length === 0 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
          )}
          <span className="text-gray-600 truncate">Célcsoportok</span>
          <span className="text-gray-400">({structure.segments.length - issuesByType.segment.length}/{structure.segments.length})</span>
        </div>

        {/* Topics */}
        <div className="flex items-center gap-1.5 text-xs">
          {issuesByType.topic.length === 0 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
          )}
          <span className="text-gray-600 truncate">Témák</span>
          <span className="text-gray-400">({(structure.topics?.length || 0) - issuesByType.topic.length}/{structure.topics?.length || 0})</span>
        </div>

        {/* Narratives */}
        <div className="flex items-center gap-1.5 text-xs">
          {issuesByType.narrative.length === 0 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
          )}
          <span className="text-gray-600 truncate">Narratívák</span>
          <span className="text-gray-400">({(structure.narratives?.length || 0) - issuesByType.narrative.length}/{structure.narratives?.length || 0})</span>
        </div>

        {/* Matrix */}
        <div className="flex items-center gap-1.5 text-xs">
          {issuesByType.matrix.length === 0 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
          )}
          <span className="text-gray-600 truncate">Matrix</span>
        </div>
      </div>
    </div>
  )
}

