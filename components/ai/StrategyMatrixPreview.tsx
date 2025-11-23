'use client'

import React, { useState } from 'react'
import { X, Check, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { MessageStrategy } from '@/lib/ai/schemas'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface GeneratedStrategy {
  segment_id: string
  topic_id: string
  segment_name: string
  topic_name: string
  strategy: MessageStrategy
}

interface StrategyMatrixPreviewProps {
  isOpen: boolean
  onClose: () => void
  strategies: GeneratedStrategy[]
  onSave: (approvedStrategies: GeneratedStrategy[]) => Promise<void>
}

export function StrategyMatrixPreview({
  isOpen,
  onClose,
  strategies,
  onSave
}: StrategyMatrixPreviewProps) {
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'reject'>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDecision = (id: string, decision: 'approve' | 'reject') => {
    setDecisions(prev => ({ ...prev, [id]: decision }))
  }

  const handleBulkDecision = (decision: 'approve' | 'reject') => {
    const newDecisions: Record<string, 'approve' | 'reject'> = {}
    strategies.forEach((s, index) => {
      const id = `${s.segment_id}-${s.topic_id}`
      newDecisions[id] = decision
    })
    setDecisions(newDecisions)
  }

  const handleSave = async () => {
    const approved = strategies.filter(s => {
      const id = `${s.segment_id}-${s.topic_id}`
      return decisions[id] === 'approve'
    })

    console.log('[StrategyMatrixPreview] handleSave called:', {
      totalStrategies: strategies.length,
      approvedCount: approved.length,
      decisions: decisions
    })

    if (approved.length === 0) {
      console.warn('[StrategyMatrixPreview] No approved strategies')
      toast.error('Nincs jóváhagyott stratégia')
      return
    }

    console.log('[StrategyMatrixPreview] Approved strategies:', approved)
    setIsSaving(true)
    try {
      console.log('[StrategyMatrixPreview] Calling onSave with', approved.length, 'strategies')
      await onSave(approved)
      console.log('[StrategyMatrixPreview] onSave completed successfully')
      onClose()
    } catch (error) {
      console.error('[StrategyMatrixPreview] Failed to save strategies:', error)
      console.error('[StrategyMatrixPreview] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error('Hiba történt a mentés során')
      // Re-throw the error so it can be handled by the caller if needed
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSaving && !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-display font-bold text-gray-900">
                Generált Stratégiák Áttekintése
              </DialogTitle>
              <DialogDescription className="mt-1 text-gray-500">
                {strategies.length} stratégia generálva. Hagyd jóvá azokat, amelyeket menteni szeretnél.
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkDecision('reject')}>
                <ThumbsDown className="w-4 h-4 mr-2 text-red-500" />
                Összes elvetése
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkDecision('approve')}>
                <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
                Összes jóváhagyása
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-gray-50/50">
          <div className="p-6 space-y-4">
            {strategies.map((item, index) => {
              const id = `${item.segment_id}-${item.topic_id}`
              const decision = decisions[id]
              const isExpanded = expandedId === id

              return (
                <div 
                  key={id} 
                  className={`
                    bg-white rounded-xl border transition-all duration-200 overflow-hidden
                    ${decision === 'approve' ? 'border-green-200 shadow-sm ring-1 ring-green-100' : 
                      decision === 'reject' ? 'border-red-200 opacity-60' : 
                      'border-gray-200 shadow-sm hover:border-primary-200'}
                  `}
                >
                  {/* Header */}
                  <div className="p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {item.segment_name}
                        </Badge>
                        <span className="text-gray-300">×</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {item.topic_name}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight mb-1">
                        {item.strategy.strategy_core.positioning_statement}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.strategy.strategy_core.core_message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={decision === 'approve' ? 'default' : 'outline'}
                        size="sm"
                        className={decision === 'approve' ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'}
                        onClick={() => handleDecision(id, 'approve')}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={decision === 'reject' ? 'destructive' : 'outline'}
                        size="sm"
                        className={decision === 'reject' ? '' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}
                        onClick={() => handleDecision(id, 'reject')}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(id)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/30 p-4">
                      <Tabs defaultValue="core" className="w-full">
                        <TabsList className="w-full justify-start mb-4 bg-white border border-gray-200 p-1 h-auto">
                          <TabsTrigger value="core" className="text-xs">Strategy Core</TabsTrigger>
                          <TabsTrigger value="style" className="text-xs">Style & Tone</TabsTrigger>
                          <TabsTrigger value="funnel" className="text-xs">CTA & Funnel</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="core" className="space-y-4 mt-0">
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pozicionálás</h5>
                              <p className="text-sm text-gray-900">{item.strategy.strategy_core.positioning_statement}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fő Üzenet</h5>
                              <p className="text-sm text-gray-900">{item.strategy.strategy_core.core_message}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Alátámasztó Üzenetek</h5>
                              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {item.strategy.strategy_core.supporting_messages.map((msg, i) => (
                                  <li key={i}>{msg}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="style" className="space-y-4 mt-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hangnem</h5>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.strategy.style_tone.tone_profile.keywords.map((k, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-700">{k}</Badge>
                                ))}
                              </div>
                              <p className="text-sm text-gray-700">{item.strategy.style_tone.tone_profile.description}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nyelvezet</h5>
                              <p className="text-sm text-gray-700">{item.strategy.style_tone.language_style}</p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="funnel" className="space-y-4 mt-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Funnel Szakasz</h5>
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                                {item.strategy.cta_funnel.funnel_stage}
                              </Badge>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CTA Célok</h5>
                              <div className="flex flex-wrap gap-1">
                                {item.strategy.cta_funnel.cta_objectives.map((obj, i) => (
                                  <span key={i} className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{obj}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-500">
              {Object.values(decisions).filter(d => d === 'approve').length} jóváhagyva / {strategies.length} összesen
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                Mégse
              </Button>
              <Button onClick={handleSave} disabled={isSaving || Object.values(decisions).filter(d => d === 'approve').length === 0}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Kiválasztottak Mentése
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
