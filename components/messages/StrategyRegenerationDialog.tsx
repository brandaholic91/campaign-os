'use client'

import React from 'react'
import { MessageStrategy } from '@/lib/ai/schemas'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, Check, X } from 'lucide-react'

interface StrategyRegenerationDialogProps {
  isOpen: boolean
  onClose: () => void
  originalStrategy: MessageStrategy
  regeneratedStrategy: MessageStrategy
  onReplace: () => void
  onKeep: () => void
  isReplacing?: boolean
}

export function StrategyRegenerationDialog({
  isOpen,
  onClose,
  originalStrategy,
  regeneratedStrategy,
  onReplace,
  onKeep,
  isReplacing = false,
}: StrategyRegenerationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-display font-bold text-gray-900">
            Stratégia Újragenerálás
          </DialogTitle>
          <DialogDescription className="mt-1 text-gray-500">
            Hasonlítsd össze az eredeti és az újragenerált stratégiát. Válaszd ki, hogy melyiket szeretnéd megtartani.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 h-full p-6">
            {/* Original Strategy */}
            <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Eredeti Stratégia
                </h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <StrategyContent strategy={originalStrategy} />
              </ScrollArea>
            </div>

            {/* Regenerated Strategy */}
            <div className="flex flex-col border border-primary-200 rounded-xl overflow-hidden bg-primary-50/30">
              <div className="bg-primary-100 px-4 py-3 border-b border-primary-200">
                <h3 className="font-semibold text-primary-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                  Újragenerált Stratégia
                </h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <StrategyContent strategy={regeneratedStrategy} />
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" onClick={onKeep} disabled={isReplacing}>
              <X className="w-4 h-4 mr-2" />
              Eredeti Megtartása
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isReplacing}>
                Mégse
              </Button>
              <Button 
                onClick={onReplace} 
                disabled={isReplacing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isReplacing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Csere folyamatban...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Csere Újra
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StrategyContent({ strategy }: { strategy: MessageStrategy }) {
  const { strategy_core, style_tone, cta_funnel, extra_fields } = strategy

  return (
    <Tabs defaultValue="core" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="core" className="text-xs">Stratégiai mag</TabsTrigger>
        <TabsTrigger value="tone" className="text-xs">Stílus/tónus</TabsTrigger>
        <TabsTrigger value="funnel" className="text-xs">CTA/funnel</TabsTrigger>
        <TabsTrigger value="extra" className="text-xs">Extra</TabsTrigger>
      </TabsList>

      <TabsContent value="core" className="space-y-4 mt-0">
        <Section title="Pozicionálás">
          <p className="text-sm text-gray-700 leading-relaxed">{strategy_core.positioning_statement}</p>
        </Section>
        
        <Section title="Fő üzenet">
          <p className="text-base font-bold text-gray-900">{strategy_core.core_message}</p>
        </Section>

        <Section title="Alátámasztó üzenetek">
          <ul className="list-disc pl-5 space-y-1">
            {strategy_core.supporting_messages.map((msg, i) => (
              <li key={i} className="text-sm text-gray-700">{msg}</li>
            ))}
          </ul>
        </Section>

        <Section title="Bizonyítékok">
          <ul className="list-disc pl-5 space-y-1">
            {strategy_core.proof_points.map((point, i) => (
              <li key={i} className="text-sm text-gray-700">{point}</li>
            ))}
          </ul>
        </Section>

        {strategy_core.objections_reframes && strategy_core.objections_reframes.length > 0 && (
          <Section title="Kifogáskezelés">
            <ul className="list-disc pl-5 space-y-1">
              {strategy_core.objections_reframes.map((item, i) => (
                <li key={i} className="text-sm text-gray-700">{item}</li>
              ))}
            </ul>
          </Section>
        )}
      </TabsContent>

      <TabsContent value="tone" className="space-y-4 mt-0">
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

        <div className="grid grid-cols-2 gap-4">
          <Section title="DOs">
            <ul className="list-disc pl-5 space-y-1">
              {style_tone.communication_guidelines.do.map((item, i) => (
                <li key={i} className="text-sm text-green-700">{item}</li>
              ))}
            </ul>
          </Section>
          <Section title="DONTs">
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

      <TabsContent value="funnel" className="space-y-4 mt-0">
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
              <div key={i} className="p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-800 border border-gray-200">
                {pattern}
              </div>
            ))}
          </div>
        </Section>

        {cta_funnel.friction_reducers && cta_funnel.friction_reducers.length > 0 && (
          <Section title="Súrlódáscsökkentők">
            <ul className="list-disc pl-5 space-y-2">
              {cta_funnel.friction_reducers.map((item, i) => (
                <li key={i} className="text-sm text-gray-700">{item}</li>
              ))}
            </ul>
          </Section>
        )}
      </TabsContent>

      <TabsContent value="extra" className="space-y-4 mt-0">
        {extra_fields ? (
          <>
            {extra_fields.framing_type && (
              <Section title="Keretezés">
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
              <Section title="Kockázatok">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                  {extra_fields.risk_notes}
                </div>
              </Section>
            )}
            
            {!extra_fields.framing_type && (!extra_fields.key_phrases || extra_fields.key_phrases.length === 0) && !extra_fields.risk_notes && (
              <div className="text-center py-10 text-gray-500 italic">
                Nincsenek extra mezők.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 italic">
            Nincsenek extra mezők.
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}
