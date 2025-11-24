'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SprintFocusGoalType } from '@/lib/ai/schemas'
import { Database } from '@/lib/supabase/types'

type Sprint = Database['campaign_os']['Tables']['sprints']['Row']
type Segment = Database['campaign_os']['Tables']['segments']['Row']
type Topic = Database['campaign_os']['Tables']['topics']['Row']

interface SprintEditFormProps {
  sprint: Sprint
  campaignId: string
  onSuccess: () => void
  onCancel: () => void
}

const focusGoalLabels: Record<SprintFocusGoalType, string> = {
  awareness: 'Tudatosság',
  engagement: 'Engedélyezés',
  consideration: 'Fontolgatás',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const focusGoalOptions: SprintFocusGoalType[] = [
  'awareness',
  'engagement',
  'consideration',
  'conversion',
  'mobilization',
]

export function SprintEditForm({
  sprint,
  campaignId,
  onSuccess,
  onCancel,
}: SprintEditFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [channels, setChannels] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: sprint.name || '',
    start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '',
    end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '',
    focus_goal: (sprint.focus_goal as SprintFocusGoalType) || 'awareness',
    focus_description: (sprint.focus_description as string) || '',
    focus_segments: [] as string[],
    focus_topics: [] as string[],
    focus_channels: (sprint.focus_channels as string[]) || [],
    success_indicators: (sprint.success_indicators as any[]) || [],
  })

  // Load segments, topics, and existing sprint relationships
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      // Load segments
      const { data: segmentsData } = await db
        .from('segments')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('name', { ascending: true })

      if (segmentsData) {
        setSegments(segmentsData)
      }

      // Load topics
      const { data: topicsData } = await db
        .from('topics')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('name', { ascending: true })

      if (topicsData) {
        setTopics(topicsData)
      }

      // Load existing sprint relationships
      const { data: sprintSegments } = await db
        .from('sprint_segments')
        .select('segment_id')
        .eq('sprint_id', sprint.id)

      const { data: sprintTopics } = await db
        .from('sprint_topics')
        .select('topic_id')
        .eq('sprint_id', sprint.id)

      if (sprintSegments) {
        setFormData(prev => ({
          ...prev,
          focus_segments: sprintSegments.map(s => s.segment_id),
        }))
      }

      if (sprintTopics) {
        setFormData(prev => ({
          ...prev,
          focus_topics: sprintTopics.map(t => t.topic_id),
        }))
      }

      // Load channels (from campaign_channels or use default list)
      // For now, use a default list of common channels
      setChannels([
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'youtube',
        'tiktok',
        'email',
        'website',
      ])
    }

    loadData()
  }, [sprint.id, campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate dates
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setError('A befejezési dátumnak a kezdési dátum után kell lennie')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.name.trim()) {
        setError('A sprint neve kötelező')
        setLoading(false)
        return
      }

      if (formData.focus_segments.length === 0) {
        setError('Legalább egy fókusz szegmens szükséges')
        setLoading(false)
        return
      }

      if (formData.focus_topics.length === 0) {
        setError('Legalább egy fókusz téma szükséges')
        setLoading(false)
        return
      }

      if (formData.focus_channels.length === 0) {
        setError('Legalább egy csatorna szükséges')
        setLoading(false)
        return
      }

      // Update sprint via PUT endpoint
      const response = await fetch(`/api/sprints/${sprint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          focus_goal: formData.focus_goal,
          focus_description: formData.focus_description,
          focus_segments: formData.focus_segments,
          focus_topics: formData.focus_topics,
          focus_channels: formData.focus_channels,
          success_indicators: formData.success_indicators,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Sikertelen frissítés')
      }

      // Validate related content slots
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      const { data: contentSlots } = await db
        .from('content_slots')
        .select('id, date')
        .eq('sprint_id', sprint.id)

      if (contentSlots && contentSlots.length > 0) {
        const sprintStart = new Date(formData.start_date)
        const sprintEnd = new Date(formData.end_date)
        const invalidSlots = contentSlots.filter(slot => {
          const slotDate = new Date(slot.date)
          return slotDate < sprintStart || slotDate > sprintEnd
        })

        if (invalidSlots.length > 0) {
          const proceed = confirm(
            `${invalidSlots.length} tartalom slot dátumai kívül esnek az új sprint dátumtartományán. ` +
            `Szeretnéd törölni vagy áthelyezni ezeket a slotokat?`
          )

          if (proceed) {
            // Delete invalid slots
            await db
              .from('content_slots')
              .delete()
              .in('id', invalidSlots.map(s => s.id))

            toast.warning(`${invalidSlots.length} slot törölve`)
          } else {
            setLoading(false)
            return
          }
        }
      }

      toast.success('Sprint sikeresen frissítve')
      onSuccess()
    } catch (err) {
      console.error('Error updating sprint:', err)
      setError(err instanceof Error ? err.message : 'Sikertelen frissítés')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessIndicatorChange = (index: number, value: string) => {
    const newIndicators = [...formData.success_indicators]
    newIndicators[index] = value
    setFormData(prev => ({
      ...prev,
      success_indicators: newIndicators,
    }))
  }

  const addSuccessIndicator = () => {
    setFormData(prev => ({
      ...prev,
      success_indicators: [...prev.success_indicators, ''],
    }))
  }

  const removeSuccessIndicator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      success_indicators: prev.success_indicators.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sprint szerkesztése</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Sprint neve *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Pl. Sprint 1: Tudatosság növelése"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Kezdési dátum *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Befejezési dátum *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus_goal">Fókusz cél *</Label>
            <Select
              value={formData.focus_goal}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  focus_goal: value as SprintFocusGoalType,
                })
              }
              required
            >
              <SelectTrigger id="focus_goal">
                <SelectValue placeholder="Válassz célt" />
              </SelectTrigger>
              <SelectContent>
                {focusGoalOptions.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {focusGoalLabels[goal]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus_description">Fókusz leírás *</Label>
            <Textarea
              id="focus_description"
              value={formData.focus_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  focus_description: e.target.value,
                })
              }
              required
              placeholder="Rövid leírás a sprint fókuszáról..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Fókusz szegmensek *</Label>
            <MultiSelect
              options={segments.map((s) => ({
                value: s.id,
                label: s.name,
                description: s.description || undefined,
              }))}
              selected={formData.focus_segments}
              onSelectionChange={(selected) =>
                setFormData({ ...formData, focus_segments: selected })
              }
              placeholder="Válassz szegmenseket..."
            />
          </div>

          <div className="space-y-2">
            <Label>Fókusz témák *</Label>
            <MultiSelect
              options={topics.map((t) => ({
                value: t.id,
                label: t.name,
                description: t.description || undefined,
              }))}
              selected={formData.focus_topics}
              onSelectionChange={(selected) =>
                setFormData({ ...formData, focus_topics: selected })
              }
              placeholder="Válassz témákat..."
            />
          </div>

          <div className="space-y-2">
            <Label>Csatornák *</Label>
            <MultiSelect
              options={channels.map((c) => ({
                value: c,
                label: c,
              }))}
              selected={formData.focus_channels}
              onSelectionChange={(selected) =>
                setFormData({ ...formData, focus_channels: selected })
              }
              placeholder="Válassz csatornákat..."
            />
          </div>

          <div className="space-y-2">
            <Label>Sikermutatok</Label>
            {formData.success_indicators.map((indicator, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={indicator}
                  onChange={(e) =>
                    handleSuccessIndicatorChange(index, e.target.value)
                  }
                  placeholder="Sikermutató..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSuccessIndicator(index)}
                >
                  Törlés
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSuccessIndicator}
            >
              + Sikermutató hozzáadása
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Mégse
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mentés...
                </>
              ) : (
                'Mentés'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

