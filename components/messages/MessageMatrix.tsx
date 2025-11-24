'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/types'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CheckboxList } from './CheckboxList'
import { StrategyCell } from './StrategyCell'
import { StrategyDetailModal } from './StrategyDetailModal'
import { MessageStrategy } from '@/lib/ai/schemas'
import { StrategyMatrixPreview } from '@/components/ai/StrategyMatrixPreview'
import { StrategyForm } from './StrategyForm'
import { MatrixConnectionModal } from './MatrixConnectionModal'
import { DeleteMatrixConnectionsModal } from './DeleteMatrixConnectionsModal'
import { EditMatrixConnectionsModal } from './EditMatrixConnectionsModal'
import { MultiSelect } from '@/components/ui/multi-select'
import { Plus, Trash2, Pencil } from 'lucide-react'

type Segment = Database['campaign_os']['Tables']['segments']['Row']
type Topic = Database['campaign_os']['Tables']['topics']['Row']

// Temporary type definition until DB types are updated
export interface StrategyRow {
  id: string
  campaign_id: string
  segment_id: string
  topic_id: string
  content: MessageStrategy
  created_at?: string
  updated_at?: string
}

interface MessageMatrixProps {
  campaignId: string
  segments: Segment[]
  topics: Topic[]
  strategies: StrategyRow[]
  matrixEntries: any[] // TODO: Type this properly with Database types
}

export default function MessageMatrix({
  campaignId,
  segments,
  topics,
  strategies,
  matrixEntries = [],
}: MessageMatrixProps) {
  const router = useRouter()
  const [selectedCell, setSelectedCell] = useState<{
    segmentId: string
    topicId: string
    strategy?: StrategyRow
  } | null>(null)
  
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [createFormContext, setCreateFormContext] = useState<{
    segmentId: string
    topicId: string
  } | null>(null)
  
  // AI generation state (placeholders for Story 3.0.3)
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingCell, setGeneratingCell] = useState<{ segmentId: string; topicId: string } | null>(null)
  const [generatedStrategies, setGeneratedStrategies] = useState<any[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Matrix connection modal state
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Multi-select dropdown selections for strategy generation
  const [selectedSegmentsForGeneration, setSelectedSegmentsForGeneration] = useState<string[]>([])
  const [selectedTopicsForGeneration, setSelectedTopicsForGeneration] = useState<string[]>([])

  const getStrategyForCell = (segmentId: string, topicId: string) => {
    const found = strategies.find(
      (s) => s.segment_id === segmentId && s.topic_id === topicId
    )
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getStrategyForCell] Looking for segment ${segmentId}, topic ${topicId}`, {
        found: !!found,
        totalStrategies: strategies.length,
        strategies: strategies.map(s => ({ segment: s.segment_id, topic: s.topic_id }))
      })
    }
    return found
  }

  const handleCellClick = (segmentId: string, topicId: string) => {
    const strategy = getStrategyForCell(segmentId, topicId)
    if (strategy) {
      setSelectedCell({ segmentId, topicId, strategy })
      setIsDetailOpen(true)
    } else {
      // For empty cells, we might want to open create form directly
      // But for now, the cell itself handles the "Create" click
    }
  }

  const handleCreateStrategy = (segmentId: string, topicId: string) => {
    setCreateFormContext({ segmentId, topicId })
    setIsCreateFormOpen(true)
  }

  const handleCreateFormSave = () => {
    setIsCreateFormOpen(false)
    setCreateFormContext(null)
    // Refresh the page to reload strategies
    router.refresh()
  }

  const handleGenerateStrategy = async (segmentId: string, topicId: string) => {
    setGeneratingCell({ segmentId, topicId })
    try {
      const response = await fetch('/api/ai/strategy-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          segment_ids: [segmentId],
          topic_ids: [topicId]
        })
      })

      if (!response.ok) {
        let errorMessage = 'Hiba történt a generálás során'
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
          if (error.details) {
            errorMessage += `: ${error.details}`
          }
        } catch (parseError) {
          try {
            const text = await response.text()
            if (text) {
              errorMessage = text
            }
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText || 'Ismeretlen hiba'}`
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data.strategies || !Array.isArray(data.strategies) || data.strategies.length === 0) {
        throw new Error('Nem sikerült stratégiát generálni. Kérlek, próbáld újra.')
      }
      
      // Map response to format expected by preview
      const strategiesWithNames = data.strategies.map((s: any) => {
        const segment = segments.find(seg => seg.id === s.segment_id)
        const topic = topics.find(t => t.id === s.topic_id)
        return {
          ...s,
          segment_name: segment?.name || 'Ismeretlen',
          topic_name: topic?.name || 'Ismeretlen'
        }
      })

      setGeneratedStrategies(strategiesWithNames)
      setIsPreviewOpen(true)
    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Hiba történt a generálás során'
      toast.error(errorMessage)
    } finally {
      setGeneratingCell(null)
    }
  }

  const handleBatchGenerate = async () => {
    // Use multi-select dropdown selections
    const segmentsToUse = selectedSegmentsForGeneration.length > 0
      ? selectedSegmentsForGeneration
      : Array.from(selectedSegments)
    const topicsToUse = selectedTopicsForGeneration.length > 0
      ? selectedTopicsForGeneration
      : Array.from(selectedTopics)

    if (segmentsToUse.length === 0 || topicsToUse.length === 0) {
      toast.error('Válassz ki legalább egy célcsoportot és egy témát')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/strategy-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          segment_ids: segmentsToUse,
          topic_ids: topicsToUse
        })
      })

      if (!response.ok) {
        let errorMessage = 'Hiba történt a generálás során'
        let errorDetails: any = null
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
          errorDetails = error
          if (error.details) {
            errorMessage += `: ${error.details}`
          }
          if (error.debug) {
            console.error('[handleBatchGenerate] Error debug info:', error.debug)
          }
        } catch (parseError) {
          // Ha nem JSON a válasz, próbáljuk meg szövegként olvasni
          try {
            const text = await response.text()
            if (text) {
              errorMessage = text
            }
          } catch (textError) {
            // Ha ez sem sikerül, használjuk az alapértelmezett üzenetet
            errorMessage = `HTTP ${response.status}: ${response.statusText || 'Ismeretlen hiba'}`
          }
        }
        console.error('[handleBatchGenerate] Generation failed:', {
          status: response.status,
          errorMessage,
          errorDetails
        })
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data.strategies || !Array.isArray(data.strategies) || data.strategies.length === 0) {
        throw new Error('Nem sikerült stratégiát generálni. Kérlek, próbáld újra.')
      }
      
      // Map response to format expected by preview
      const strategiesWithNames = data.strategies.map((s: any) => {
        const segment = segments.find(seg => seg.id === s.segment_id)
        const topic = topics.find(t => t.id === s.topic_id)
        return {
          ...s,
          segment_name: segment?.name || 'Ismeretlen',
          topic_name: topic?.name || 'Ismeretlen'
        }
      })

      setGeneratedStrategies(strategiesWithNames)
      setIsPreviewOpen(true)
    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Hiba történt a generálás során'
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveStrategies = async (approvedStrategies: any[]) => {
    console.log('[handleSaveStrategies] Starting to save strategies:', approvedStrategies.length)
    console.log('[handleSaveStrategies] Approved strategies data:', JSON.stringify(approvedStrategies, null, 2))
    try {
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Save each approved strategy
      for (const item of approvedStrategies) {
        try {
          // Validate that we have the required data
          if (!item.strategy) {
            console.error('[handleSaveStrategies] Missing strategy in item:', item)
            errors.push(`${item.segment_name || 'Unknown'} × ${item.topic_name || 'Unknown'}: hiányzó stratégia adatok`)
            errorCount++
            continue
          }

          if (!item.strategy.strategy_core || !item.strategy.style_tone || !item.strategy.cta_funnel) {
            console.error('[handleSaveStrategies] Missing required strategy fields:', {
              has_strategy_core: !!item.strategy.strategy_core,
              has_style_tone: !!item.strategy.style_tone,
              has_cta_funnel: !!item.strategy.cta_funnel,
              item: item
            })
            errors.push(`${item.segment_name || 'Unknown'} × ${item.topic_name || 'Unknown'}: hiányzó kötelező mezők`)
            errorCount++
            continue
          }

          const payload = {
            campaign_id: campaignId,
            segment_id: item.segment_id,
            topic_id: item.topic_id,
            strategy_core: item.strategy.strategy_core,
            style_tone: item.strategy.style_tone,
            cta_funnel: item.strategy.cta_funnel,
            extra_fields: item.strategy.extra_fields,
            preview_summary: item.strategy.preview_summary,
          }
          console.log('[handleSaveStrategies] Saving strategy:', {
            segment_id: item.segment_id,
            topic_id: item.topic_id,
            segment_name: item.segment_name,
            topic_name: item.topic_name,
            payload_keys: Object.keys(payload)
          })
          
          const response = await fetch('/api/strategies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            const savedData = await response.json()
            console.log('[handleSaveStrategies] Strategy saved successfully:', savedData.id)
            successCount++
          } else {
            let errorData
            try {
              errorData = await response.json()
            } catch (e) {
              errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
            }
            console.error('[handleSaveStrategies] Failed to save strategy:', {
              status: response.status,
              error: errorData,
              payload: payload
            })
            if (response.status === 409) {
              // UNIQUE constraint violation - strategy already exists
              errors.push(`${item.segment_name} × ${item.topic_name}: már létezik`)
            } else {
              const errorMsg = errorData.error || errorData.details || 'Ismeretlen hiba'
              errors.push(`${item.segment_name} × ${item.topic_name}: ${errorMsg}`)
            }
            errorCount++
          }
        } catch (err) {
          console.error('Error saving strategy:', err)
          errors.push(`${item.segment_name} × ${item.topic_name}: hálózati hiba`)
          errorCount++
        }
      }

      // Show appropriate notifications
      if (successCount > 0) {
        toast.success(`${successCount} stratégia sikeresen mentve`)
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} stratégia mentése sikertelen${errors.length > 0 ? ': ' + errors.join(', ') : ''}`)
      }

      // Refresh the matrix to show new strategies
      console.log('[handleSaveStrategies] Refreshing page after saving strategies')
      // Force a hard refresh to ensure new data is loaded
      // Using setTimeout to ensure the toast notifications are visible before reload
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Unexpected error saving strategies:', error)
      toast.error('Hiba történt a mentés során')
    }
  }

  const toggleSegment = (segmentId: string) => {
    const newSet = new Set(selectedSegments)
    if (newSet.has(segmentId)) {
      newSet.delete(segmentId)
    } else {
      newSet.add(segmentId)
    }
    setSelectedSegments(newSet)
  }

  const toggleTopic = (topicId: string) => {
    const newSet = new Set(selectedTopics)
    if (newSet.has(topicId)) {
      newSet.delete(topicId)
    } else {
      newSet.add(topicId)
    }
    setSelectedTopics(newSet)
  }

  // Handle multi-select dropdown selections for strategy generation
  const handleSegmentsSelect = (selectedIds: string[]) => {
    setSelectedSegmentsForGeneration(selectedIds)
    setSelectedSegments(new Set(selectedIds))
  }

  const handleTopicsSelect = (selectedIds: string[]) => {
    setSelectedTopicsForGeneration(selectedIds)
    setSelectedTopics(new Set(selectedIds))
  }

  // Convert segments and topics to checkbox list format
  const segmentsForList = segments.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    selected: selectedSegments.has(s.id)
  }))

  const topicsForList = topics.map(t => ({
    id: t.id,
    name: t.name,
    subtitle: t.category || undefined,
    selected: selectedTopics.has(t.id)
  }))

  const selectedSegmentsArray = segments.filter(s => selectedSegments.has(s.id))
  const selectedTopicsArray = topics.filter(t => selectedTopics.has(t.id))
  // Count based on selected multi-select values
  const cellCount = selectedSegmentsArray.length * selectedTopicsArray.length
  const hasAnyData = segments.length > 0 && topics.length > 0

  return (
    <div className="flex-1 flex flex-col gap-8">
      {/* Configuration Panel (Bento Grid Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* New Matrix Connection Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col">
            <h3 className="text-lg font-display font-bold mb-2">Új Matrix Kapcsolat</h3>
            <p className="text-sm text-gray-500 mb-4">
              Hozz létre egy új kapcsolatot egy célcsoport és egy téma között.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => setIsMatrixModalOpen(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Új Kapcsolat Létrehozása
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center gap-2"
                disabled={matrixEntries.length === 0}
              >
                <Pencil className="w-4 h-4" />
                Kapcsolatok Szerkesztése
              </Button>
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-2"
                disabled={matrixEntries.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Kapcsolatok Törlése
              </Button>
            </div>
          </div>

          {/* Strategy Generation Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col">
            <h3 className="text-lg font-display font-bold mb-2">Stratégia Generálás</h3>
            <p className="text-sm text-gray-500 mb-4">
              Válassz ki egy vagy több célcsoportot és témát a stratégia generálásához.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment-select">Célcsoportok</Label>
                <MultiSelect
                  options={segments.map(s => ({
                    value: s.id,
                    label: s.name,
                    description: s.description || undefined
                  }))}
                  selected={selectedSegmentsForGeneration}
                  onSelectionChange={handleSegmentsSelect}
                  placeholder="Válassz célcsoportokat..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic-select">Témák</Label>
                <MultiSelect
                  options={topics.map(t => ({
                    value: t.id,
                    label: t.name,
                    description: t.description || undefined
                  }))}
                  selected={selectedTopicsForGeneration}
                  onSelectionChange={handleTopicsSelect}
                  placeholder="Válassz témákat..."
                />
              </div>
            </div>
          </div>

          {/* Action & Stats Panel */}
          <div className="lg:col-span-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-soft p-6 text-white flex flex-col justify-between relative overflow-hidden group">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10">
              <h3 className="text-lg font-display font-bold mb-1">Stratégia Generátor</h3>
              <p className="text-gray-400 text-sm mb-6">Válaszd ki a paramétereket a kommunikációs stratégiák létrehozásához.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <span className="block text-2xl font-bold">{cellCount}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Kombináció</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <span className="block text-2xl font-bold">{selectedTopicsArray.length * 0.5}p</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Becsült idő</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              <button
                onClick={handleBatchGenerate}
                disabled={isGenerating || cellCount === 0}
                className={`
                  w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all
                  bg-primary-600 hover:bg-primary-500 text-white shadow-glow
                  ${isGenerating || cellCount === 0 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Generálás folyamatban...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Stratégiák Generálása
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Matrix View */}
        <div className="flex-1 flex flex-col">
            {hasAnyData ? (
              <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden flex flex-col relative">
                <div className="overflow-auto custom-scrollbar flex-1 max-h-[800px]">
                  <div 
                    className="grid"
                    style={{
                      gridTemplateColumns: `minmax(280px, 320px) repeat(${topics.length}, minmax(340px, 1fr))`
                    }}
                  >
                    {/* Corner Cell */}
                    <div className="sticky top-0 left-0 z-30 bg-gray-50/95 backdrop-blur-sm border-r border-b border-gray-200 p-6 flex flex-col justify-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Y tengely</span>
                      <span className="text-sm font-bold text-gray-900">Célcsoportok</span>
                      <div className="w-full h-px bg-gray-200 my-2 transform rotate-3 origin-left w-[110%]"></div>
                      <div className="self-end text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">X tengely</span>
                        <span className="text-sm font-bold text-gray-900">Témák</span>
                      </div>
                    </div>

                    {/* Header Row (Topics) */}
                    {topics.map(topic => (
                      <div key={topic.id} className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-r border-b border-gray-200 p-6 flex flex-col justify-center min-h-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">T</span>
                            <h3 className="text-gray-900 font-display font-bold text-sm leading-tight">{topic.name}</h3>
                        </div>
                        {topic.category && <p className="text-gray-500 text-xs font-medium pl-8">{topic.category}</p>}
                      </div>
                    ))}

                    {/* Rows (Audiences + Cells) */}
                    {segments.map(segment => (
                      <React.Fragment key={segment.id}>
                        {/* Sticky Row Header (Audience) */}
                        <div className="sticky left-0 z-10 bg-white border-r border-b border-gray-200 p-6 group transition-colors hover:bg-gray-50">
                           <div className="h-full flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">A</span>
                                <h3 className="text-gray-900 font-display font-bold text-sm">{segment.name}</h3>
                            </div>
                            {segment.description && (
                              <p className="text-gray-500 text-xs leading-relaxed pl-8">
                                {segment.description}
                              </p>
                            )}
                           </div>
                        </div>

                        {/* Data Cells */}
                        {topics.map(topic => {
                          const strategy = getStrategyForCell(segment.id, topic.id)
                          const matrixEntry = matrixEntries.find(
                            (m) => m.segment_id === segment.id && m.topic_id === topic.id
                          )
                          
                          if (process.env.NODE_ENV === 'development' && strategy) {
                            console.log(`[MessageMatrix] Rendering cell for segment ${segment.id}, topic ${topic.id}`, {
                              hasStrategy: !!strategy,
                              hasContent: !!strategy.content,
                              contentKeys: strategy.content ? Object.keys(strategy.content) : null
                            })
                          }
                          const isCellGenerating = generatingCell?.segmentId === segment.id && generatingCell?.topicId === topic.id
                          return (
                            <StrategyCell
                              key={`${segment.id}-${topic.id}`}
                              strategy={strategy?.content}
                              matrixEntry={matrixEntry}
                              isLoading={isCellGenerating}
                              onClick={() => handleCellClick(segment.id, topic.id)}
                              onCreate={() => handleCreateStrategy(segment.id, topic.id)}
                              onGenerate={() => handleGenerateStrategy(segment.id, topic.id)}
                            />
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-display font-bold text-xl mb-2">Kezdjük el a tervezést</h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Hozz létre <span className="text-blue-600 font-medium">célcsoportokat</span> és <span className="text-primary-600 font-medium">témákat</span> a mátrix megjelenítéséhez.
                </p>
              </div>
            )}
        </div>

      {selectedCell && selectedCell.strategy && (
        <StrategyDetailModal
          strategy={selectedCell.strategy.content}
          strategyId={selectedCell.strategy.id}
          campaignId={campaignId}
          segmentId={selectedCell.segmentId}
          topicId={selectedCell.topicId}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onRefresh={() => router.refresh()}
        />
      )}

      {isCreateFormOpen && createFormContext && (
        <StrategyForm
          isOpen={isCreateFormOpen}
          onClose={() => {
            setIsCreateFormOpen(false)
            setCreateFormContext(null)
          }}
          campaignId={campaignId}
          segmentId={createFormContext.segmentId}
          topicId={createFormContext.topicId}
          onSave={handleCreateFormSave}
        />
      )}

      <StrategyMatrixPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        strategies={generatedStrategies}
        onSave={handleSaveStrategies}
      />

      <MatrixConnectionModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        segments={segments}
        topics={topics}
        campaignId={campaignId}
        onSuccess={() => router.refresh()}
      />

      <DeleteMatrixConnectionsModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        segments={segments}
        topics={topics}
        matrixEntries={matrixEntries}
        campaignId={campaignId}
        onSuccess={() => router.refresh()}
      />

      <EditMatrixConnectionsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        segments={segments}
        topics={topics}
        matrixEntries={matrixEntries}
        campaignId={campaignId}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}