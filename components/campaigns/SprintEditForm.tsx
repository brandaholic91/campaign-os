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
  
  // Check if sprint is saved to database (has created_at) or is from preview (SprintPlan)
  const isUnsavedSprint = sprint.created_at === null
  const sprintWithExtras = sprint as Sprint & { _focus_segments?: string[], _focus_topics?: string[] }

  // Helper to parse JSON fields from database
  const parseJsonField = (field: any, defaultValue: any[] = []): any[] => {
    // Handle null, undefined
    if (field === null || field === undefined) {
      return defaultValue
    }
    
    // If it's already an array, process and return it
    if (Array.isArray(field)) {
      // Filter out null/undefined items, but keep empty strings
      return field
        .filter(item => item !== null && item !== undefined)
        .map(item => {
          if (typeof item === 'string') return item
          if (typeof item === 'number' || typeof item === 'boolean') return String(item)
          // For objects, try to stringify them or get a meaningful string
          if (typeof item === 'object') {
            // If object has a 'value' or 'text' property, use that
            if ('value' in item && typeof item.value === 'string') return item.value
            if ('text' in item && typeof item.text === 'string') return item.text
            // Otherwise stringify
            try {
              return JSON.stringify(item)
            } catch {
              return String(item)
            }
          }
          return String(item)
        })
    }
    
    // If it's a string, try to parse it as JSON first
    if (typeof field === 'string') {
      if (!field.trim()) return defaultValue
      try {
        const parsed = JSON.parse(field)
        if (Array.isArray(parsed)) {
          return parsed
            .filter(item => item !== null && item !== undefined)
            .map(item => typeof item === 'string' ? item : String(item))
        }
        return defaultValue
      } catch {
        // If parsing fails, treat as single string item
        return [field]
      }
    }
    
    // For other types (number, boolean), convert to string array
    if (typeof field === 'number' || typeof field === 'boolean') {
      return [String(field)]
    }
    
    return defaultValue
  }

  const [formData, setFormData] = useState(() => {
    // Initial state - parse all fields from sprint prop
    const initialData = {
      name: sprint.name || '',
      start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '',
      end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '',
      focus_goal: (sprint.focus_goal as SprintFocusGoalType) || 'awareness',
      focus_description: (sprint.focus_description as string) || '',
      focus_segments: (isUnsavedSprint && sprintWithExtras._focus_segments) ? sprintWithExtras._focus_segments : [] as string[],
      focus_topics: (isUnsavedSprint && sprintWithExtras._focus_topics) ? sprintWithExtras._focus_topics : [] as string[],
      focus_channels: (sprint.focus_channels as string[]) || [],
      success_indicators: parseJsonField(sprint.success_indicators, []),
      success_criteria: parseJsonField(sprint.success_criteria, []),
      risks_and_watchouts: parseJsonField(sprint.risks_and_watchouts, []),
      key_messages_summary: (sprint.key_messages_summary as string) || '',
      order: sprint.order || 1,
      status: sprint.status || 'planned',
    }
    
    console.log('🔵 SprintEditForm initial state:', {
      sprintId: sprint.id,
      isUnsavedSprint,
      rawData: {
        success_indicators: sprint.success_indicators,
        success_criteria: sprint.success_criteria,
        risks_and_watchouts: sprint.risks_and_watchouts,
        key_messages_summary: sprint.key_messages_summary,
      },
      parsedData: {
        success_indicators: initialData.success_indicators,
        success_criteria: initialData.success_criteria,
        risks_and_watchouts: initialData.risks_and_watchouts,
        key_messages_summary: initialData.key_messages_summary,
      },
    })
    
    return initialData
  })

  // Update formData when sprint prop changes (especially for unsaved sprints from AI generation)
  useEffect(() => {
    // For unsaved sprints (from AI generation), update all fields from sprint prop
    if (isUnsavedSprint) {
      const newFormData = {
        name: sprint.name || '',
        start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '',
        end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '',
        focus_goal: (sprint.focus_goal as SprintFocusGoalType) || 'awareness',
        focus_description: (sprint.focus_description as string) || '',
        focus_segments: sprintWithExtras._focus_segments || [],
        focus_topics: sprintWithExtras._focus_topics || [],
        focus_channels: (sprint.focus_channels as string[]) || [],
        success_indicators: parseJsonField(sprint.success_indicators, []),
        success_criteria: parseJsonField(sprint.success_criteria, []),
        risks_and_watchouts: parseJsonField(sprint.risks_and_watchouts, []),
        key_messages_summary: (sprint.key_messages_summary as string) || '',
        order: sprint.order || 1,
        status: sprint.status || 'planned',
      }
      setFormData(newFormData)
    }
  }, [sprint.id, sprint.success_indicators, sprint.success_criteria, sprint.risks_and_watchouts, sprint.key_messages_summary, isUnsavedSprint, sprintWithExtras._focus_segments, sprintWithExtras._focus_topics])

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

      // Load existing sprint relationships only if sprint is saved to database
      if (!isUnsavedSprint) {
        const { data: sprintSegments } = await db
          .from('sprint_segments')
          .select('segment_id')
          .eq('sprint_id', sprint.id)

        const { data: sprintTopics } = await db
          .from('sprint_topics')
          .select('topic_id')
          .eq('sprint_id', sprint.id)

        const { data: sprintChannels } = await db
          .from('sprint_channels')
          .select('channel_key')
          .eq('sprint_id', sprint.id)

        // Update formData with junction table relationships and all fields from database
        setFormData(prev => ({
          ...prev,
          focus_segments: (sprintSegments || []).map(s => s.segment_id),
          focus_topics: (sprintTopics || []).map(t => t.topic_id),
          focus_channels: (sprintChannels || []).map(c => c.channel_key),
          // Also update JSON fields from database if they exist
          success_indicators: parseJsonField(sprint.success_indicators, prev.success_indicators),
          success_criteria: parseJsonField(sprint.success_criteria, prev.success_criteria),
          risks_and_watchouts: parseJsonField(sprint.risks_and_watchouts, prev.risks_and_watchouts),
          key_messages_summary: (sprint.key_messages_summary as string) || prev.key_messages_summary,
          order: sprint.order || prev.order,
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
  }, [sprint.id, campaignId, isUnsavedSprint])

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

      // Check if sprint already exists in database (even if marked as unsaved)
      let sprintExists = false
      if (isUnsavedSprint && sprint.id) {
        const supabase = createClient()
        const db = supabase.schema('campaign_os')
        const { data: existingSprint } = await db
          .from('sprints')
          .select('id')
          .eq('id', sprint.id)
          .single()
        
        sprintExists = !!existingSprint
      }

      // If sprint is not saved yet and doesn't exist, use POST to create it, otherwise use PUT to update
      const shouldUsePost = isUnsavedSprint && !sprintExists
      const url = shouldUsePost ? '/api/sprints' : `/api/sprints/${sprint.id}`
      const method = shouldUsePost ? 'POST' : 'PUT'
      
      const requestBody: any = {
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        focus_goal: formData.focus_goal,
        focus_description: formData.focus_description,
        focus_segments: formData.focus_segments,
        focus_topics: formData.focus_topics,
        focus_channels: formData.focus_channels,
        success_indicators: formData.success_indicators,
        success_criteria: formData.success_criteria,
        risks_and_watchouts: formData.risks_and_watchouts,
        key_messages_summary: formData.key_messages_summary || null,
        order: formData.order,
        status: formData.status,
      }

      // For POST, include campaign_id and use the existing sprint ID
      if (shouldUsePost) {
        requestBody.campaign_id = campaignId
        requestBody.id = sprint.id // Use the existing ID from SprintPlan
        requestBody.order = sprint.order || 1
        requestBody.status = 'planned'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Sikertelen frissítés')
      }

      // Validate related content slots only if sprint was already saved
      if (!isUnsavedSprint) {
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
                  value={typeof indicator === 'string' ? indicator : ''}
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

          <div className="space-y-2">
            <Label>Sikerkritériumok</Label>
            {formData.success_criteria.map((criterion, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={typeof criterion === 'string' ? criterion : ''}
                  onChange={(e) => {
                    const newCriteria = [...formData.success_criteria]
                    newCriteria[index] = e.target.value
                    setFormData(prev => ({ ...prev, success_criteria: newCriteria }))
                  }}
                  placeholder="Sikerkritérium..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      success_criteria: prev.success_criteria.filter((_, i) => i !== index),
                    }))
                  }}
                >
                  Törlés
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  success_criteria: [...prev.success_criteria, ''],
                }))
              }}
            >
              + Sikerkritérium hozzáadása
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Kockázatok és figyelendő pontok</Label>
            {formData.risks_and_watchouts.map((risk, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={typeof risk === 'string' ? risk : ''}
                  onChange={(e) => {
                    const newRisks = [...formData.risks_and_watchouts]
                    newRisks[index] = e.target.value
                    setFormData(prev => ({ ...prev, risks_and_watchouts: newRisks }))
                  }}
                  placeholder="Kockázat vagy figyelendő pont..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      risks_and_watchouts: prev.risks_and_watchouts.filter((_, i) => i !== index),
                    }))
                  }}
                >
                  Törlés
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  risks_and_watchouts: [...prev.risks_and_watchouts, ''],
                }))
              }}
            >
              + Kockázat hozzáadása
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_messages_summary">Kulcs üzenetek összefoglalója</Label>
            <Textarea
              id="key_messages_summary"
              value={formData.key_messages_summary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  key_messages_summary: e.target.value,
                })
              }
              placeholder="Rövid összefoglaló a sprint kulcs üzeneteiről..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Sprint sorrendje</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Státusz</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

