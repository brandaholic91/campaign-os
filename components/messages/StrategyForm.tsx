'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageStrategySchema } from '@/lib/ai/schemas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { StrategyCoreSection } from './StrategyFormSections/StrategyCoreSection'
import { StyleToneSection } from './StrategyFormSections/StyleToneSection'
import { CTAFunnelSection } from './StrategyFormSections/CTAFunnelSection'
import { ExtraFieldsSection } from './StrategyFormSections/ExtraFieldsSection'
import { z } from 'zod'

// Form schema that includes metadata fields
const StrategyFormSchema = z.object({
  strategy_core: MessageStrategySchema.shape.strategy_core,
  style_tone: MessageStrategySchema.shape.style_tone,
  cta_funnel: MessageStrategySchema.shape.cta_funnel,
  extra_fields: MessageStrategySchema.shape.extra_fields.optional(),
  preview_summary: z.string().optional(),
})

type StrategyFormData = z.infer<typeof StrategyFormSchema>

interface StrategyFormProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  segmentId: string
  topicId: string
  initialData?: {
    id?: string
    content: StrategyFormData
  }
  onSave: () => void
}

export function StrategyForm({
  isOpen,
  onClose,
  campaignId,
  segmentId,
  topicId,
  initialData,
  onSave,
}: StrategyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isEditMode = !!initialData?.id

  const form = useForm<StrategyFormData>({
    resolver: zodResolver(StrategyFormSchema),
    defaultValues: initialData?.content || {
      strategy_core: {
        positioning_statement: '',
        core_message: '',
        supporting_messages: ['', '', ''],
        proof_points: ['', ''],
        objections_reframes: [],
      },
      style_tone: {
        tone_profile: {
          description: '',
          keywords: ['', '', ''],
        },
        language_style: '',
        communication_guidelines: {
          do: [''],
          dont: [''],
        },
        emotional_temperature: '',
      },
      cta_funnel: {
        funnel_stage: 'awareness',
        cta_objectives: [''],
        cta_patterns: ['', ''],
        friction_reducers: [],
      },
      extra_fields: {
        framing_type: undefined,
        key_phrases: [],
        risk_notes: undefined,
      },
      preview_summary: '',
    },
  })

  const { watch, setValue } = form

  // Auto-generate preview summary when strategy core changes
  const generatePreviewSummary = useCallback(() => {
    const positioningStatement = watch('strategy_core.positioning_statement')
    const coreMessage = watch('strategy_core.core_message')
    const keywords = watch('style_tone.tone_profile.keywords')
    const funnelStage = watch('cta_funnel.funnel_stage')

    if (positioningStatement && coreMessage) {
      // Extract first sentence from positioning statement
      const firstSentence = positioningStatement.split('.')[0] + '.'
      
      // Generate summary
      const summary = `Pozíció: ${firstSentence} Mag: ${coreMessage}. Tónus: ${keywords?.filter(k => k).join(', ')}. Szakasz: ${funnelStage || 'awareness'}.`
      
      setValue('preview_summary', summary)
    }
  }, [watch, setValue])

  // Debounced auto-generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isEditMode || !initialData?.content.preview_summary) {
        generatePreviewSummary()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [
    watch('strategy_core.positioning_statement'),
    watch('strategy_core.core_message'),
    watch('style_tone.tone_profile.keywords'),
    watch('cta_funnel.funnel_stage'),
    generatePreviewSummary,
    isEditMode,
    initialData,
  ])

  const onSubmit = async (data: StrategyFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditMode
        ? `/api/strategies/${initialData.id}`
        : '/api/strategies'
      
      const method = isEditMode ? 'PUT' : 'POST'

      const body = isEditMode
        ? data
        : {
            campaign_id: campaignId,
            segment_id: segmentId,
            topic_id: topicId,
            ...data,
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Handle UNIQUE constraint violation
        if (response.status === 409) {
          toast.error(error.error || 'A stratégia már létezik ehhez a szegmens × téma kombinációhoz')
          return
        }

        throw new Error(error.error || 'Hiba történt a mentés során')
      }

      toast.success(isEditMode ? 'Stratégia sikeresen frissítve' : 'Stratégia sikeresen létrehozva')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving strategy:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a mentés során')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id || !confirm('Biztosan törölni szeretnéd ezt a stratégiát?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/strategies/${initialData.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Hiba történt a törlés során')
      }

      toast.success('Stratégia sikeresen törölve')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error deleting strategy:', error)
      toast.error('Hiba történt a törlés során')
    } finally {
      setIsDeleting(false)
    }
  }

  const previewSummary = watch('preview_summary')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {isEditMode ? 'Stratégia szerkesztése' : 'Új stratégia létrehozása'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="core" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="core">Stratégiai mag</TabsTrigger>
              <TabsTrigger value="tone">Stílus/tónus</TabsTrigger>
              <TabsTrigger value="funnel">CTA/funnel</TabsTrigger>
              <TabsTrigger value="extra">Extra</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2 mt-4">
              <TabsContent value="core" className="mt-0">
                <StrategyCoreSection form={form} />
              </TabsContent>

              <TabsContent value="tone" className="mt-0">
                <StyleToneSection form={form} />
              </TabsContent>

              <TabsContent value="funnel" className="mt-0">
                <CTAFunnelSection form={form} />
              </TabsContent>

              <TabsContent value="extra" className="mt-0">
                <ExtraFieldsSection form={form} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Preview Summary */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="preview_summary">
                Előnézet összefoglaló
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={generatePreviewSummary}
              >
                Újragenerálás
              </Button>
            </div>
            <Textarea
              id="preview_summary"
              value={previewSummary || ''}
              onChange={(e) => setValue('preview_summary', e.target.value)}
              placeholder="Auto-generált összefoglaló (manuálisan szerkeszthető)..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {previewSummary?.length || 0} karakter
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t mt-4">
            <div>
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Törlés...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Törlés
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                Mégse
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mentés...
                  </>
                ) : (
                  'Stratégia mentése'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
