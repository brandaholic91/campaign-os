'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { ExecutionReadinessResult } from '@/lib/validation/campaign-structure'
import type { CampaignStructure } from '@/lib/validation/campaign-structure'

interface ExecutionReadinessChecklistProps {
  campaignId: string
  structure: CampaignStructure
  validationStatus: ExecutionReadinessResult
}

export function ExecutionReadinessChecklist({
  campaignId,
  structure,
  validationStatus,
}: ExecutionReadinessChecklistProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

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

  // Group issues by element
  const groupIssuesByElement = (issues: typeof validationStatus.issues) => {
    const grouped: Record<string, string[]> = {}
    issues.forEach(issue => {
      if (!grouped[issue.element]) {
        grouped[issue.element] = []
      }
      grouped[issue.element].push(issue.issue)
    })
    return grouped
  }

  const goalsGrouped = groupIssuesByElement(issuesByType.goal)
  const segmentsGrouped = groupIssuesByElement(issuesByType.segment)
  const topicsGrouped = groupIssuesByElement(issuesByType.topic)
  const narrativesGrouped = groupIssuesByElement(issuesByType.narrative)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Végrehajtásra Kész Checklist</CardTitle>
          <Badge 
            variant={validationStatus.ready ? 'default' : 'destructive'}
            className={validationStatus.ready ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {validationStatus.ready ? 'Kész' : 'Nem Kész'}
          </Badge>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Előrehaladás</span>
            <span className="font-medium">{completeCriteria}/{totalCriteria} kritérium teljesítve ({progressPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                validationStatus.ready ? 'bg-green-600' : 'bg-yellow-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Goals Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('goals')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedSections.has('goals') ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">Célok</span>
              <Badge variant="outline" className="ml-2">
                {structure.goals.length - issuesByType.goal.length}/{structure.goals.length}
              </Badge>
            </div>
            {issuesByType.goal.length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </button>
          {expandedSections.has('goals') && (
            <div className="px-4 pb-4 space-y-2">
              {Object.keys(goalsGrouped).length === 0 ? (
                <p className="text-sm text-muted-foreground">Minden cél teljes</p>
              ) : (
                Object.entries(goalsGrouped).map(([element, issues]) => (
                  <div key={element} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="font-medium text-sm mb-1">{element}</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Segments Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('segments')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedSections.has('segments') ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">Célcsoportok</span>
              <Badge variant="outline" className="ml-2">
                {structure.segments.length - issuesByType.segment.length}/{structure.segments.length}
              </Badge>
            </div>
            {issuesByType.segment.length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </button>
          {expandedSections.has('segments') && (
            <div className="px-4 pb-4 space-y-2">
              {Object.keys(segmentsGrouped).length === 0 ? (
                <p className="text-sm text-muted-foreground">Minden célcsoport teljes</p>
              ) : (
                Object.entries(segmentsGrouped).map(([element, issues]) => (
                  <div key={element} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="font-medium text-sm mb-1">{element}</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Topics Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('topics')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedSections.has('topics') ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">Témák</span>
              <Badge variant="outline" className="ml-2">
                {(structure.topics?.length || 0) - issuesByType.topic.length}/{structure.topics?.length || 0}
              </Badge>
            </div>
            {issuesByType.topic.length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </button>
          {expandedSections.has('topics') && (
            <div className="px-4 pb-4 space-y-2">
              {Object.keys(topicsGrouped).length === 0 ? (
                <p className="text-sm text-muted-foreground">Minden téma teljes</p>
              ) : (
                Object.entries(topicsGrouped).map(([element, issues]) => (
                  <div key={element} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="font-medium text-sm mb-1">{element}</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Narratives Section */}
        {(
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('narratives')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('narratives') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-medium">Narratívák</span>
                <Badge variant="outline" className="ml-2">
                  {(structure.narratives?.length || 0) - issuesByType.narrative.length}/{structure.narratives?.length || 0}
                </Badge>
              </div>
              {issuesByType.narrative.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </button>
            {expandedSections.has('narratives') && (
              <div className="px-4 pb-4 space-y-2">
                {Object.keys(narrativesGrouped).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Minden narratíva teljes</p>
                ) : (
                  Object.entries(narrativesGrouped).map(([element, issues]) => (
                    <div key={element} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="font-medium text-sm mb-1">{element}</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Matrix Section */}
        {(
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('matrix')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('matrix') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-medium">Matrix Szabályok</span>
              </div>
              {issuesByType.matrix.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </button>
            {expandedSections.has('matrix') && (
              <div className="px-4 pb-4 space-y-2">
                {issuesByType.matrix.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Minden matrix szabály betartva</p>
                ) : (
                  issuesByType.matrix.map((issue, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-800">{issue.issue}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

