'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoalSchema } from '@/lib/ai/schemas'
import { Goal } from '@/lib/validation/campaign-structure'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GoalEditModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal & { id: string }
  campaignId: string
  onSave: () => void
}

export function GoalEditModal({ isOpen, onClose, goal, campaignId, onSave }: GoalEditModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const form = useForm<Goal>({
    resolver: zodResolver(GoalSchema),
    defaultValues: {
      title: goal.title,
      description: goal.description || '',
      priority: goal.priority,
      funnel_stage: goal.funnel_stage,
      kpi_hint: goal.kpi_hint || '',
      target_metric: goal.target_metric || {}
    }
  })

  const onSubmit = async (data: Goal) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update goal')
      }

      onSave()
      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cél szerkesztése</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Cél megnevezése</Label>
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
              <Select 
                defaultValue={String(form.getValues('priority'))} 
                onValueChange={(val) => form.setValue('priority', parseInt(val) as 1 | 2 | 3)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz prioritást" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Magas</SelectItem>
                  <SelectItem value="2">2 - Közepes</SelectItem>
                  <SelectItem value="3">3 - Alacsony</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funnel_stage">Funnel fázis</Label>
              <Select 
                defaultValue={form.getValues('funnel_stage')} 
                onValueChange={(val) => form.setValue('funnel_stage', val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz fázist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="consideration">Consideration</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="mobilization">Mobilization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kpi_hint">KPI javaslat</Label>
            <Input id="kpi_hint" {...form.register('kpi_hint')} placeholder="pl. 1000 új feliratkozó" />
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
