'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ExecutionPlan } from '@/lib/ai/schemas'
import { isReadyForExecution } from '@/lib/validation/campaign-structure'
import { SprintList } from './SprintList'
import { ContentCalendar } from './ContentCalendar'
import { Loader2, AlertCircle, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ExecutionPlannerProps {
  campaignId: string
}

export function ExecutionPlanner({ campaignId }: ExecutionPlannerProps) {
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  // Check campaign readiness
  useEffect(() => {
    async function checkReadiness() {
      try {
        const supabase = createClient()
        const db = supabase.schema('campaign_os')

        // Fetch campaign with all related data
        const { data: campaign } = await db
          .from('campaigns')
          .select('*, goals(*), segments(*), topics(*), narratives(*)')
          .eq('id', campaignId)
          .single()

        if (!campaign) return

        // Fetch segment_topic_matrix
        const segmentIds = (campaign.segments || []).map((s: any) => s.id)
        const topicIds = (campaign.topics || []).map((t: any) => t.id)
        
        const { data: matrixEntries } = segmentIds.length > 0 && topicIds.length > 0
          ? await db
              .from('segment_topic_matrix')
              .select('*')
              .in('segment_id', segmentIds)
              .in('topic_id', topicIds)
          : { data: [] }

        // Transform matrix entries
        const segmentTopicMatrix = (matrixEntries || []).map((entry: any) => ({
          segment_id: entry.segment_id,
          topic_id: entry.topic_id,
          importance: entry.importance,
          role: entry.role,
          summary: entry.summary,
        }))

        const structure = {
          goals: campaign.goals || [],
          segments: campaign.segments || [],
          topics: campaign.topics || [],
          narratives: campaign.narratives || [],
          segment_topic_matrix: segmentTopicMatrix,
        }

        const readiness = isReadyForExecution(structure as any)
        setIsReady(readiness.ready)
      } catch (err) {
        console.error('Error checking readiness:', err)
      }
    }
    checkReadiness()
  }, [campaignId])

  const handleGenerate = async () => {
    // Check readiness before generating
    if (!isReady) {
      const proceed = confirm('A kampány struktúra nem teljesen validált. Folytatod a generálást?')
      if (!proceed) return
    }

    setIsGenerating(true)
    setError(null)
    setProgress('')
    setExecutionPlan(null)

    try {
      const response = await fetch('/api/ai/campaign-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      if (!response.ok) {
        throw new Error('Hiba történt a generálás során')
      }

      // Set up SSE connection
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Nem sikerült létrehozni a stream kapcsolatot')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'progress') {
                setProgress(data.message || '')
                if (data.sprints) {
                  // Progress update with sprints
                }
                if (data.slots !== undefined) {
                  // Progress update with slots count
                }
              } else if (data.type === 'warning') {
                toast.warning(data.message || 'Figyelmeztetés')
              } else if (data.type === 'complete') {
                setExecutionPlan(data.executionPlan)
                setProgress('')
                setIsGenerating(false)
                toast.success('Sprint terv és tartalomnaptár sikeresen generálva')
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Ismeretlen hiba')
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt'
      setError(errorMessage)
      setIsGenerating(false)
      toast.error(errorMessage)
    }
  }

  const handleRegenerate = async () => {
    const confirmed = confirm(
      'Biztosan újragenerálod? A jelenlegi terv törlődik.'
    )

    if (!confirmed) return

    setIsGenerating(true)
    setError(null)
    setProgress('Régi terv törlése...')
    setExecutionPlan(null)

    try {
      // Delete existing plan from database
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      const { data: existingSprints } = await db
        .from('sprints')
        .select('id')
        .eq('campaign_id', campaignId)

      if (existingSprints && existingSprints.length > 0) {
        const sprintIds = existingSprints.map((s) => s.id)

        // Delete content slots
        await db.from('content_slots').delete().in('sprint_id', sprintIds)

        // Delete junction tables
        await db.from('sprint_segments').delete().in('sprint_id', sprintIds)
        await db.from('sprint_topics').delete().in('sprint_id', sprintIds)
        await db.from('sprint_channels').delete().in('sprint_id', sprintIds)

        // Delete sprints
        await db.from('sprints').delete().eq('campaign_id', campaignId)
      }

      // Generate new plan
      setProgress('Új terv generálása...')
      await handleGenerate()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ismeretlen hiba történt'
      setError(errorMessage)
      setIsGenerating(false)
      toast.error(errorMessage)
    }
  }

  const handleCancel = () => {
    setExecutionPlan(null)
    setProgress('')
    setError(null)
  }

  const handleSave = async () => {
    // Story 5.4 will implement this
    toast.info('Mentés funkció hamarosan elérhető (Story 5.4)')
  }

  return (
    <div className="space-y-6">
      {/* Generate Button Section */}
      {!executionPlan && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-gray-900 mb-2">
                Sprintek és tartalomnaptár generálása AI-val
              </h3>
              <p className="text-sm text-gray-600">
                Az AI generál egy részletes sprint tervet és tartalomnaptárt a kampány struktúrája alapján.
              </p>
            </div>
            <div className="ml-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                title={!isReady ? 'A kampány struktúra nem teljesen validált. Javasoljuk, hogy először töltse ki az összes kötelező mezőt.' : undefined}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generálás...
                  </>
                ) : (
                  'Sprintek és tartalomnaptár generálása AI-val'
                )}
              </Button>
            </div>
          </div>
          {!isReady && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  A kampány struktúra nem teljesen validált
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Javasoljuk, hogy először töltse ki az összes kötelező mezőt a kampány struktúrájában.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Section */}
      {isGenerating && progress && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <p className="text-sm font-medium text-gray-900">{progress}</p>
          </div>
        </div>
      )}

      {/* Error Section */}
      {error && (
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Újrapróbálás
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {executionPlan && !isGenerating && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-soft flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-gray-900">
              Előnézet
            </h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Újragenerálás
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Mégse
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Mentés
              </Button>
            </div>
          </div>

          {/* Sprint List */}
          <SprintList 
            sprints={executionPlan.sprints} 
            campaignId={campaignId}
            onSprintUpdate={() => {
              // Reload execution plan after update
              // For now, just refresh the page or reload data
              window.location.reload()
            }}
          />

          {/* Content Calendar */}
          <ContentCalendar
            slots={executionPlan.content_calendar}
            sprints={executionPlan.sprints}
            campaignId={campaignId}
            onSlotUpdate={() => {
              // Reload execution plan after update
              window.location.reload()
            }}
          />
        </div>
      )}
    </div>
  )
}

