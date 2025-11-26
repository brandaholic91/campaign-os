'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ContentDraft } from '@/lib/ai/schemas'

interface DraftGenerationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slotId: string
  onSuccess: (drafts: ContentDraft[]) => void
}

export function DraftGenerationModal({ open, onOpenChange, slotId, onSuccess }: DraftGenerationModalProps) {
  const [variantCount, setVariantCount] = useState<string>('1')
  const [tonePreference, setTonePreference] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress('Kapcsolódás...')

    try {
      const response = await fetch(`/api/ai/content-slots/${slotId}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_count: parseInt(variantCount),
          tone_preference: tonePreference || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Hiba történt a generálás indításakor')
      }

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
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Ismeretlen hiba')
              } else if (data.type === 'complete') {
                toast.success('Draftok sikeresen generálva')
                onSuccess(data.drafts)
                onOpenChange(false)
                setIsGenerating(false)
                setProgress('')
                // Reset form
                setTonePreference('')
                setVariantCount('1')
                return
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt'
      setIsGenerating(false)
      setProgress('')
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isGenerating && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tartalom Generálása AI-jal</DialogTitle>
          <DialogDescription>
            Válassz beállításokat a vázlatok generálásához. Az AI figyelembe veszi a slot stratégiai beállításait.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variant-count">Variánsok száma</Label>
            <Select
              value={variantCount}
              onValueChange={setVariantCount}
              disabled={isGenerating}
            >
              <SelectTrigger id="variant-count">
                <SelectValue placeholder="Válassz..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 variáns</SelectItem>
                <SelectItem value="2">2 variáns</SelectItem>
                <SelectItem value="3">3 variáns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tone-preference">Hangnem preferenciák (opcionális)</Label>
            <Textarea
              id="tone-preference"
              placeholder="Pl. Legyen kicsit humorosabb, vagy fókuszáljon a sürgősségre..."
              value={tonePreference}
              onChange={(e) => setTonePreference(e.target.value)}
              disabled={isGenerating}
              rows={3}
            />
          </div>

          {isGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
              <p className="text-sm font-medium text-gray-700">{progress}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Mégse
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generálás...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generálás Indítása
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
