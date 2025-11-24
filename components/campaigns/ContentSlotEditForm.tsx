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
import { ContentObjective, ContentType } from '@/lib/ai/schemas'
import { Database } from '@/lib/supabase/types'

type ContentSlot = Database['campaign_os']['Tables']['content_slots']['Row']
type Segment = Database['campaign_os']['Tables']['segments']['Row']
type Topic = Database['campaign_os']['Tables']['topics']['Row']
type Sprint = Database['campaign_os']['Tables']['sprints']['Row']

interface ContentSlotEditFormProps {
  slot: ContentSlot
  campaignId: string
  onSuccess: () => void
  onCancel: () => void
}

const objectiveLabels: Record<ContentObjective, string> = {
  reach: 'Elérés',
  engagement: 'Engedélyezés',
  traffic: 'Forgalom',
  lead: 'Lead',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const contentTypeLabels: Record<ContentType, string> = {
  short_video: 'Rövid videó',
  story: 'Story',
  static_image: 'Statikus kép',
  carousel: 'Karruszel',
  live: 'Élő',
  long_post: 'Hosszú poszt',
  email: 'Email',
}

const statusLabels: Record<string, string> = {
  planned: 'Tervezett',
  draft: 'Vázlat',
  published: 'Közzétéve',
}

const objectiveOptions: ContentObjective[] = [
  'reach',
  'engagement',
  'traffic',
  'lead',
  'conversion',
  'mobilization',
]

const contentTypeOptions: ContentType[] = [
  'short_video',
  'story',
  'static_image',
  'carousel',
  'live',
  'long_post',
  'email',
]

const statusOptions: string[] = ['planned', 'draft', 'published']

export function ContentSlotEditForm({
  slot,
  campaignId,
  onSuccess,
  onCancel,
}: ContentSlotEditFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: slot.date ? slot.date.split('T')[0] : '',
    channel: slot.channel || '',
    slot_index: slot.slot_index || 1,
    primary_segment_id: slot.primary_segment_id || '',
    primary_topic_id: slot.primary_topic_id || '',
    objective: (slot.objective as ContentObjective) || 'reach',
    content_type: (slot.content_type as ContentType) || 'static_image',
    angle_hint: slot.angle_hint || '',
    notes: slot.notes || '',
    status: (slot.status as string) || 'planned',
  })

  // Load segments, topics, and sprint
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

      // Load sprint to validate date range
      const { data: sprintData } = await db
        .from('sprints')
        .select('*')
        .eq('id', slot.sprint_id)
        .single()

      if (sprintData) {
        setSprint(sprintData)
      }
    }

    loadData()
  }, [slot.sprint_id, campaignId])

  // Validate form
  const validateForm = (): boolean => {
    setValidationError(null)

    // Validate date is within sprint range
    if (sprint && formData.date) {
      const slotDate = new Date(formData.date)
      const sprintStart = new Date(sprint.start_date)
      const sprintEnd = new Date(sprint.end_date)

      if (slotDate < sprintStart || slotDate > sprintEnd) {
        setValidationError(
          `A dátumnak a sprint dátumtartományán belül kell lennie (${sprint.start_date} - ${sprint.end_date})`
        )
        return false
      }
    }

    // Validate required fields
    if (!formData.date) {
      setValidationError('A dátum kötelező')
      return false
    }

    if (!formData.channel.trim()) {
      setValidationError('A csatorna kötelező')
      return false
    }

    if (!formData.slot_index || formData.slot_index < 1) {
      setValidationError('A slot index pozitív szám kell legyen')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationError(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Check for duplicate slot_index per (date, channel)
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      const { data: existingSlots } = await db
        .from('content_slots')
        .select('id, slot_index')
        .eq('date', formData.date)
        .eq('channel', formData.channel)
        .neq('id', slot.id)

      if (existingSlots) {
        const duplicate = existingSlots.find(
          (s) => s.slot_index === formData.slot_index
        )

        if (duplicate) {
          setError(
            `Már létezik slot index ${formData.slot_index} erre a dátumra és csatornára`
          )
          setLoading(false)
          return
        }
      }

      // Update slot via PUT endpoint
      const response = await fetch(`/api/content-slots/${slot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          channel: formData.channel,
          slot_index: formData.slot_index,
          primary_segment_id: formData.primary_segment_id || null,
          primary_topic_id: formData.primary_topic_id || null,
          objective: formData.objective,
          content_type: formData.content_type,
          angle_hint: formData.angle_hint || null,
          notes: formData.notes || null,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Sikertelen frissítés')
      }

      toast.success('Tartalom slot sikeresen frissítve')
      onSuccess()
    } catch (err) {
      console.error('Error updating content slot:', err)
      setError(err instanceof Error ? err.message : 'Sikertelen frissítés')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tartalom slot szerkesztése</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || validationError) && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error || validationError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Dátum *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value })
                  setValidationError(null)
                }}
                required
              />
              {sprint && (
                <p className="text-xs text-gray-500">
                  Sprint tartomány: {sprint.start_date} - {sprint.end_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Csatorna *</Label>
              <Input
                id="channel"
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
                required
                placeholder="Pl. facebook, instagram"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slot_index">Slot index *</Label>
              <Input
                id="slot_index"
                type="number"
                min="1"
                value={formData.slot_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slot_index: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
              <p className="text-xs text-gray-500">
                Napi sorrend száma ugyanazon a csatornán
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Státusz *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Válassz státuszt" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status] || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_segment_id">Elsődleges szegmens</Label>
              <Select
                value={formData.primary_segment_id || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    primary_segment_id: value === 'none' ? '' : value,
                  })
                }
              >
                <SelectTrigger id="primary_segment_id">
                  <SelectValue placeholder="Válassz szegmenst (opcionális)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nincs</SelectItem>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_topic_id">Elsődleges téma</Label>
              <Select
                value={formData.primary_topic_id || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    primary_topic_id: value === 'none' ? '' : value,
                  })
                }
              >
                <SelectTrigger id="primary_topic_id">
                  <SelectValue placeholder="Válassz témát (opcionális)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nincs</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="objective">Cél *</Label>
              <Select
                value={formData.objective}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    objective: value as ContentObjective,
                  })
                }
                required
              >
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Válassz célt" />
                </SelectTrigger>
                <SelectContent>
                  {objectiveOptions.map((obj) => (
                    <SelectItem key={obj} value={obj}>
                      {objectiveLabels[obj]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">Tartalom típus *</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    content_type: value as ContentType,
                  })
                }
                required
              >
                <SelectTrigger id="content_type">
                  <SelectValue placeholder="Válassz típust" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {contentTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="angle_hint">Szöghint</Label>
            <Textarea
              id="angle_hint"
              value={formData.angle_hint}
              onChange={(e) =>
                setFormData({ ...formData, angle_hint: e.target.value })
              }
              placeholder="1-2 mondatos kreatív irány..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Megjegyzések</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Produkciós megjegyzések..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Mégse
            </Button>
            <Button type="submit" disabled={loading || !!validationError}>
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

