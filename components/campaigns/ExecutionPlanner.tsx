'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SprintPlan, ContentSlot } from '@/lib/ai/schemas'
import { isReadyForExecution } from '@/lib/validation/campaign-structure'
import { SprintList } from './SprintList'
import { ContentCalendar } from './ContentCalendar'
import { Loader2, AlertCircle, RefreshCw, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ExecutionPlannerProps {
  campaignId: string
}

export function ExecutionPlanner({ campaignId }: ExecutionPlannerProps) {
  const [sprints, setSprints] = useState<SprintPlan[]>([])
  const [contentSlots, setContentSlots] = useState<ContentSlot[]>([])
  const [isGeneratingSprints, setIsGeneratingSprints] = useState(false)
  const [generatingContentFor, setGeneratingContentFor] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Check campaign readiness and load existing sprints and content from database
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      
      try {
        // Load execution plan and check readiness in parallel
        const [executionResponse, structureResponse] = await Promise.all([
          fetch(`/api/campaigns/execution?campaign_id=${campaignId}`),
          fetch(`/api/campaigns/${campaignId}/structure`)
        ])

        // Load existing execution plan
        if (executionResponse.ok) {
          const savedPlan = await executionResponse.json()
          if (savedPlan) {
            setSprints(savedPlan.sprints || [])
            setContentSlots(savedPlan.content_calendar || [])
          }
        }

        // Check readiness
        if (structureResponse.ok) {
          const structure = await structureResponse.json()
          if (structure) {
            const readiness = isReadyForExecution(structure)
            setIsReady(readiness.ready)
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [campaignId])

  const handleGenerateSprints = async () => {
    // Check readiness before generating
    if (!isReady) {
      const proceed = confirm('A kampány struktúra nem teljesen validált. Folytatod a generálást?')
      if (!proceed) return
    }

    setIsGeneratingSprints(true)
    setError(null)
    setProgress('')

    try {
      const response = await fetch('/api/ai/campaign-sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      if (!response.ok) {
        // Try to read error message from response body
        let errorMessage = 'Hiba történt a sprint generálás során'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          if (errorData.issues && Array.isArray(errorData.issues)) {
            const issuesText = errorData.issues
              .map((issue: { type?: string; element?: string; issue?: string } | string) => {
                if (typeof issue === 'string') return `- ${issue}`
                return `- [${issue.type || 'unknown'}] ${issue.element || 'unknown'}: ${issue.issue || 'No details'}`
              })
              .join('\n')
            errorMessage += `\n\nProblémák:\n${issuesText}`
          }
        } catch (parseError) {
          // If parsing fails, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || errorMessage}`
        }
        throw new Error(errorMessage)
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
              } else if (data.type === 'warning') {
                toast.warning(data.message || 'Figyelmeztetés')
              } else if (data.type === 'done') {
                // Save generated sprints to database
                // The SSE sends { type: 'done', sprints: [...] } format
                const sprints = data.sprints || data.data?.sprints || []
                await saveSprints(sprints)
                setSprints(sprints)
                setProgress('')
                setIsGeneratingSprints(false)
                toast.success('Sprint struktúra sikeresen generálva')
              } else if (data.type === 'error') {
                throw new Error(data.error || data.message || 'Ismeretlen hiba')
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
      setIsGeneratingSprints(false)
      toast.error(errorMessage)
    }
  }

  const handleGenerateContentSlots = async (sprintId: string) => {
    setGeneratingContentFor(sprintId)
    setError(null)
    setProgress('')

    try {
      const response = await fetch(`/api/ai/campaign-sprints/${sprintId}/content-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Optional: weekly_post_volume override can be added here
      })

      if (!response.ok) {
        // Try to read error message from response body
        let errorMessage = 'Hiba történt a tartalomnaptár generálás során'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          if (errorData.issues && Array.isArray(errorData.issues)) {
            const issuesText = errorData.issues
              .map((issue: { type?: string; element?: string; issue?: string } | string) => {
                if (typeof issue === 'string') return `- ${issue}`
                return `- [${issue.type || 'unknown'}] ${issue.element || 'unknown'}: ${issue.issue || 'No details'}`
              })
              .join('\n')
            errorMessage += `\n\nProblémák:\n${issuesText}`
          }
        } catch (parseError) {
          // If parsing fails, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || errorMessage}`
        }
        throw new Error(errorMessage)
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
              } else if (data.type === 'warning') {
                toast.warning(data.message || 'Figyelmeztetés')
              } else if (data.type === 'done') {
                // Save generated content slots to database
                // The SSE sends { type: 'done', content_slots: [...] } format
                const contentSlots = data.content_slots || data.data?.content_slots || []
                await saveContentSlots(sprintId, contentSlots)
                // Reload all content slots from database
                await loadContentSlots()
                setProgress('')
                setGeneratingContentFor(null)
                toast.success('Tartalomnaptár sikeresen generálva')
              } else if (data.type === 'error') {
                throw new Error(data.error || data.message || 'Ismeretlen hiba')
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
      setGeneratingContentFor(null)
      toast.error(errorMessage)
    }
  }

  const saveSprints = async (sprintsToSave: SprintPlan[]) => {
    // Use the existing save endpoint to save sprints
    const response = await fetch('/api/campaigns/execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        executionPlan: {
          sprints: sprintsToSave,
          content_calendar: [], // Empty content calendar
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      let errorMessage = errorData.error || 'Hiba történt a sprint mentés során'
      if (errorData.details && Array.isArray(errorData.details)) {
        const detailsText = errorData.details
          .map((detail: { path?: string; message?: string }) => 
            detail.path ? `${detail.path}: ${detail.message || 'invalid'}` : detail.message || 'invalid'
          )
          .join('\n')
        errorMessage += `\n\nRészletek:\n${detailsText}`
      }
      throw new Error(errorMessage)
    }
  }

  const saveContentSlots = async (sprintId: string, slotsToSave: ContentSlot[]) => {
    const supabase = createClient()
    const db = supabase.schema('campaign_os')

    // Delete existing content slots for this sprint
    await db.from('content_slots').delete().eq('sprint_id', sprintId)

    // Insert new content slots
    for (const slot of slotsToSave) {
      await db.from('content_slots').insert({
        sprint_id: sprintId,
        date: slot.date,
        channel: slot.channel,
        slot_index: slot.slot_index,
        primary_segment_id: slot.primary_segment_id,
        primary_topic_id: slot.primary_topic_id,
        objective: slot.objective,
        content_type: slot.content_type,
        angle_hint: slot.angle_hint,
        notes: slot.notes,
      })
    }
  }

  const loadContentSlots = async () => {
    try {
      const response = await fetch(`/api/campaigns/execution?campaign_id=${campaignId}`)
      if (response.ok) {
        const savedPlan = await response.json()
        if (savedPlan) {
          setContentSlots(savedPlan.content_calendar || [])
        }
      }
    } catch (err) {
      console.error('Error loading content slots:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <p className="text-sm font-medium text-gray-900">Betöltés...</p>
          </div>
        </div>
      )}

      {/* Generate Sprint Structure Button Section */}
      {!isLoading && sprints.length === 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-gray-900 mb-2">
                Sprintstruktúra generálása AI-val
              </h3>
              <p className="text-sm text-gray-600">
                Az AI generál egy részletes sprint tervet a kampány struktúrája alapján.
              </p>
            </div>
            <div className="ml-4">
              <Button
                onClick={handleGenerateSprints}
                disabled={isGeneratingSprints}
                title={!isReady ? 'A kampány struktúra nem teljesen validált. Javasoljuk, hogy először töltse ki az összes kötelező mezőt.' : undefined}
              >
                {isGeneratingSprints ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generálás...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Sprintstruktúra generálása AI-val
                  </>
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
      {(isGeneratingSprints || generatingContentFor) && progress && (
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
              <p className="text-sm font-medium text-red-900 mb-2 whitespace-pre-line">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={sprints.length === 0 ? handleGenerateSprints : () => setError(null)}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {sprints.length === 0 ? 'Újrapróbálás' : 'Bezárás'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sprint List with Per-Sprint Content Generation */}
      {!isLoading && sprints.length > 0 && (
        <div className="space-y-6">
          <SprintList 
            sprints={sprints} 
            campaignId={campaignId}
            onSprintUpdate={() => {
              // Reload execution plan after update
              window.location.reload()
            }}
            onGenerateContent={handleGenerateContentSlots}
            generatingContentFor={generatingContentFor}
          />

          {/* Content Calendar */}
          {contentSlots.length > 0 && (
            <ContentCalendar
              slots={contentSlots}
              sprints={sprints}
              campaignId={campaignId}
              onSlotUpdate={() => {
                // Reload content slots after update
                loadContentSlots()
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

