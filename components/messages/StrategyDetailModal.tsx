import React from 'react'
import { MessageStrategy } from '@/lib/ai/schemas'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StrategyForm } from './StrategyForm'
import { StrategyRegenerationDialog } from './StrategyRegenerationDialog'
import { useState } from 'react'

interface StrategyDetailModalProps {
  strategy: MessageStrategy
  strategyId: string
  campaignId: string
  segmentId: string
  topicId: string
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function StrategyDetailModal({
  strategy,
  strategyId,
  campaignId,
  segmentId,
  topicId,
  isOpen,
  onClose,
  onRefresh,
}: StrategyDetailModalProps) {
  const { strategy_core, style_tone, cta_funnel, extra_fields } = strategy
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratedStrategy, setRegeneratedStrategy] = useState<MessageStrategy | null>(null)
  const [showRegenerationDialog, setShowRegenerationDialog] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)

  const handleEdit = () => {
    setIsEditFormOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a stratégiát?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Hiba történt a törlés során')
      }

      const { toast } = await import('sonner')
      toast.success('Stratégia sikeresen törölve')
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Error deleting strategy:', error)
      const { toast } = await import('sonner')
      toast.error('Hiba történt a törlés során')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditFormSave = () => {
    setIsEditFormOpen(false)
    onRefresh()
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const response = await fetch('/api/ai/regenerate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          segment_id: segmentId,
          topic_id: topicId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hiba történt az újragenerálás során')
      }

      const data = await response.json()
      setRegeneratedStrategy(data.strategy)
      setShowRegenerationDialog(true)
      
      const { toast } = await import('sonner')
      toast.success('Stratégia sikeresen újragenerálva')
    } catch (error) {
      console.error('Regeneration error:', error)
      const { toast } = await import('sonner')
      toast.error(error instanceof Error ? error.message : 'Hiba történt az újragenerálás során')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleReplaceStrategy = async () => {
    if (!regeneratedStrategy) return

    setIsReplacing(true)
    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regeneratedStrategy),
      })

      if (!response.ok) {
        throw new Error('Hiba történt a csere során')
      }

      const { toast } = await import('sonner')
      toast.success('Stratégia sikeresen frissítve az új verzióval')
      setShowRegenerationDialog(false)
      setRegeneratedStrategy(null)
      onRefresh()
    } catch (error) {
      console.error('Replace error:', error)
      const { toast } = await import('sonner')
      toast.error('Hiba történt a csere során')
    } finally {
      setIsReplacing(false)
    }
  }

  const handleKeepOriginal = async () => {
    setShowRegenerationDialog(false)
    setRegeneratedStrategy(null)
    const { toast } = await import('sonner')
    toast.info('Eredeti stratégia megtartva')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[800px] h-[90vh] sm:h-[80vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Stratégia Részletei</DialogTitle>
          <DialogDescription>
            A kiválasztott szegmens és téma kommunikációs stratégiája.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 h-auto">
              <TabsTrigger value="core">Stratégiai mag</TabsTrigger>
              <TabsTrigger value="tone">Stílus/tónus</TabsTrigger>
              <TabsTrigger value="funnel">CTA/funnel</TabsTrigger>
              <TabsTrigger value="extra">Extra</TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="space-y-6">
              <Section title="Pozicionálás">
                <p className="text-sm text-gray-700 leading-relaxed">{strategy_core.positioning_statement}</p>
              </Section>
              
              <Section title="Fő üzenet (Core Message)">
                <p className="text-lg font-bold text-gray-900">{strategy_core.core_message}</p>
              </Section>

              <Section title="Alátámasztó üzenetek">
                <ul className="list-disc pl-5 space-y-2">
                  {strategy_core.supporting_messages.map((msg, i) => (
                    <li key={i} className="text-sm text-gray-700">{msg}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Bizonyítékok (Proof Points)">
                <ul className="list-disc pl-5 space-y-2">
                  {strategy_core.proof_points.map((point, i) => (
                    <li key={i} className="text-sm text-gray-700">{point}</li>
                  ))}
                </ul>
              </Section>

              {strategy_core.objections_reframes && (
                <Section title="Kifogáskezelés">
                  <ul className="list-disc pl-5 space-y-2">
                    {strategy_core.objections_reframes.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </TabsContent>

            <TabsContent value="tone" className="space-y-6">
              <Section title="Tónus profil">
                <p className="text-sm text-gray-700 mb-3">{style_tone.tone_profile.description}</p>
                <div className="flex flex-wrap gap-2">
                  {style_tone.tone_profile.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </Section>

              <Section title="Nyelvezet">
                <p className="text-sm text-gray-700">{style_tone.language_style}</p>
              </Section>

              <div className="grid grid-cols-2 gap-6">
                <Section title="DOs (Amit tegyünk)">
                  <ul className="list-disc pl-5 space-y-1">
                    {style_tone.communication_guidelines.do.map((item, i) => (
                      <li key={i} className="text-sm text-green-700">{item}</li>
                    ))}
                  </ul>
                </Section>
                <Section title="DONTs (Amit kerüljünk)">
                  <ul className="list-disc pl-5 space-y-1">
                    {style_tone.communication_guidelines.dont.map((item, i) => (
                      <li key={i} className="text-sm text-red-700">{item}</li>
                    ))}
                  </ul>
                </Section>
              </div>

              <Section title="Érzelmi hőmérséklet">
                <p className="text-sm text-gray-700">{style_tone.emotional_temperature}</p>
              </Section>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-6">
              <Section title="Funnel szakasz">
                <Badge className="text-sm px-3 py-1 capitalize">
                  {cta_funnel.funnel_stage}
                </Badge>
              </Section>

              <Section title="CTA Célok">
                <ul className="list-disc pl-5 space-y-2">
                  {cta_funnel.cta_objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-gray-700">{obj}</li>
                  ))}
                </ul>
              </Section>

              <Section title="CTA Minták">
                <div className="flex flex-col gap-2">
                  {cta_funnel.cta_patterns.map((pattern, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-800 border border-gray-100">
                      {pattern}
                    </div>
                  ))}
                </div>
              </Section>

              {cta_funnel.friction_reducers && (
                <Section title="Súrlódáscsökkentők">
                  <ul className="list-disc pl-5 space-y-2">
                    {cta_funnel.friction_reducers.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </TabsContent>

            <TabsContent value="extra" className="space-y-6">
              {extra_fields ? (
                <>
                  {extra_fields.framing_type && (
                    <Section title="Keretezés (Framing)">
                      <p className="text-sm text-gray-700">{extra_fields.framing_type}</p>
                    </Section>
                  )}

                  {extra_fields.key_phrases && extra_fields.key_phrases.length > 0 && (
                    <Section title="Kulcskifejezések">
                      <div className="flex flex-wrap gap-2">
                        {extra_fields.key_phrases.map((phrase, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </Section>
                  )}

                  {extra_fields.risk_notes && (
                    <Section title="Kockázatok / Megjegyzések">
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                        {extra_fields.risk_notes}
                      </div>
                    </Section>
                  )}
                  
                  {!extra_fields.framing_type && (!extra_fields.key_phrases || extra_fields.key_phrases.length === 0) && !extra_fields.risk_notes && (
                    <div className="text-center py-10 text-gray-500 italic">
                      Nincsenek extra mezők kitöltve ehhez a stratégiához.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-gray-500 italic">
                  Nincsenek extra mezők ehhez a stratégiához.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 border-t mt-4 gap-3 sm:gap-0">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting || isRegenerating}
            className="gap-2 w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Törlés...' : 'Törlés'}
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} disabled={isRegenerating} className="w-full sm:w-auto">Bezárás</Button>
            <Button 
              variant="outline" 
              onClick={handleRegenerate} 
              disabled={isRegenerating}
              className="gap-2 w-full sm:w-auto"
            >
              {isRegenerating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Generálás...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Újragenerálás
                </>
              )}
            </Button>
            <Button onClick={handleEdit} disabled={isRegenerating} className="gap-2 w-full sm:w-auto">
              <Edit className="w-4 h-4" />
              Szerkesztés
            </Button>
          </div>
        </div>
      </DialogContent>

      {isEditFormOpen && (
        <StrategyForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          campaignId="" // Not needed for edit
          segmentId="" // Not needed for edit
          topicId="" // Not needed for edit
          initialData={{
            id: strategyId,
            content: strategy,
          }}
          onSave={handleEditFormSave}
        />
      )}

      {showRegenerationDialog && regeneratedStrategy && (
        <StrategyRegenerationDialog
          isOpen={showRegenerationDialog}
          onClose={() => setShowRegenerationDialog(false)}
          originalStrategy={strategy}
          regeneratedStrategy={regeneratedStrategy}
          onReplace={handleReplaceStrategy}
          onKeep={handleKeepOriginal}
          isReplacing={isReplacing}
        />
      )}
    </Dialog>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}
