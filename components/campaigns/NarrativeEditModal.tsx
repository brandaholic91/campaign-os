'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NarrativeSchema } from '@/lib/ai/schemas'
import { Narrative } from '@/lib/validation/campaign-structure'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NarrativeEditModalProps {
  isOpen: boolean
  onClose: () => void
  narrative: Narrative & { id: string }
  campaignId: string
  onSave: () => void
}

export function NarrativeEditModal({ isOpen, onClose, narrative, campaignId, onSave }: NarrativeEditModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const form = useForm<Narrative>({
    resolver: zodResolver(NarrativeSchema),
    defaultValues: {
      title: narrative.title,
      description: narrative.description || '',
      priority: narrative.priority,
      suggested_phase: narrative.suggested_phase,
      primary_goal_ids: narrative.primary_goal_ids || [],
      primary_topic_ids: narrative.primary_topic_ids || []
    }
  })

  const onSubmit = async (data: Narrative) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/narratives/${narrative.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update narrative')
      }

      onSave()
      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error saving narrative:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Narratíva szerkesztése</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Narratíva címe</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea id="description" {...form.register('description')} className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioritás (1-3)</Label>
              <Input 
                type="number" 
                min={1} 
                max={3}
                {...form.register('priority', { valueAsNumber: true })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggested_phase">Javasolt fázis</Label>
              <Select 
                defaultValue={form.getValues('suggested_phase')} 
                onValueChange={(val) => form.setValue('suggested_phase', val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz fázist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early">Early</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Mégse</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mentés
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
