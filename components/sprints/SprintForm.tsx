'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SprintFocusGoalType } from '@/lib/ai/schemas'
import { Database } from '@/lib/supabase/types'

type Sprint = Database['campaign_os']['Tables']['sprints']['Row'] & {
  focus_segments?: string[]
  focus_topics?: string[]
  focus_channels?: string[]
  success_indicators?: any[]
}
type Segment = Database['campaign_os']['Tables']['segments']['Row']
type Topic = Database['campaign_os']['Tables']['topics']['Row']

interface SprintFormData {
  name: string
  start_date: string
  end_date: string
  focus_goal: SprintFocusGoalType
  focus_description: string
  focus_segments_primary: string[]
  focus_segments_secondary: string[]
  focus_topics_primary: string[]
  focus_topics_secondary: string[]
  focus_channels_primary: string[]
  focus_channels_secondary: string[]
  success_indicators: string[]
  risks_and_watchouts: string[]
  success_criteria: string[]
  status: 'planned' | 'active' | 'closed'
  order: number
  key_messages_summary: string
  suggested_weekly_post_volume: {
    total_posts_per_week?: number
    video_posts_per_week?: number
    stories_per_week?: number
  } | null
}

interface SprintFormProps {
  campaignId: string
  initialData?: Sprint
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

export default function SprintForm({
  campaignId,
  initialData,
  onSuccess,
  onCancel,
}: SprintFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const loadedSprintIdRef = useRef<string | undefined>(undefined)

  // Helper to parse JSON fields from database
  // Supabase returns JSON fields as objects/arrays directly, not as strings
  const parseJsonField = (field: any, defaultValue: any[] = []): any[] => {
    // Handle null, undefined, and empty string
    if (field === null || field === undefined) {
      return defaultValue
    }
    
    // If it's already an array, process and return it
    if (Array.isArray(field)) {
      // Convert all items to strings, filter out null/undefined, but keep empty strings
      return field
        .filter(item => item !== null && item !== undefined)
        .map(item => {
          if (typeof item === 'string') return item
          if (typeof item === 'number' || typeof item === 'boolean') return String(item)
          // For objects, try to stringify them
          try {
            return JSON.stringify(item)
          } catch {
            return String(item)
          }
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
        // If parsing fails, treat it as a single item array
        return [field]
      }
    }
    
    // If it's a number or boolean, convert to string array
    if (typeof field === 'number' || typeof field === 'boolean') {
      return [String(field)]
    }
    
    // If it's an object but not an array, return default
    if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
      // Don't convert objects to arrays
      return defaultValue
    }
    
    return defaultValue
  }

  const categorizeByPriority = (
    rows: { priority: string | null; [key: string]: string | null }[] = [],
    keyField: string
  ) => {
    const primary: string[] = []
    const secondary: string[] = []
    rows.forEach((row) => {
      if (!row[keyField]) return
      const priority = row.priority === 'secondary' ? 'secondary' : 'primary'
      if (priority === 'secondary') {
        secondary.push(row[keyField])
      } else {
        primary.push(row[keyField])
      }
    })
    return { primary, secondary }
  }

  const ensureCount = (label: string, values: string[], min: number, max: number) => {
    if (values.length < min) {
      return `${label} mezőben legalább ${min} elem szükséges`
    }
    if (values.length > max) {
      return `${label} mezőben legfeljebb ${max} elem lehet`
    }
    return null
  }

  // Initialize formData directly from initialData or empty defaults
  const getInitialFormData = (): SprintFormData => {
    if (!initialData) {
      return {
        name: '',
        start_date: '',
        end_date: '',
        focus_goal: 'awareness' as SprintFocusGoalType,
        focus_description: '',
        focus_segments_primary: [],
        focus_segments_secondary: [],
        focus_topics_primary: [],
        focus_topics_secondary: [],
        focus_channels_primary: [],
        focus_channels_secondary: [],
        success_indicators: [],
        risks_and_watchouts: [],
        success_criteria: [],
        status: 'planned',
        order: 1,
        key_messages_summary: '',
        suggested_weekly_post_volume: null,
      }
    }

    return {
      name: initialData.name || '',
      start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
      end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
      focus_goal: (initialData.focus_goal as SprintFocusGoalType) || 'awareness',
      focus_description: (initialData.focus_description as string) || '',
      focus_segments_primary: ((initialData as any).focus_segments_primary as string[] | undefined) || (initialData.focus_segments as string[] | undefined) || [],
      focus_segments_secondary: ((initialData as any).focus_segments_secondary as string[] | undefined) || [],
      focus_topics_primary: ((initialData as any).focus_topics_primary as string[] | undefined) || (initialData.focus_topics as string[] | undefined) || [],
      focus_topics_secondary: ((initialData as any).focus_topics_secondary as string[] | undefined) || [],
      focus_channels_primary: ((initialData as any).focus_channels_primary as string[] | undefined) || (initialData.focus_channels as string[] | undefined) || [],
      focus_channels_secondary: ((initialData as any).focus_channels_secondary as string[] | undefined) || [],
      success_indicators: parseJsonField(initialData.success_indicators, []),
      risks_and_watchouts: parseJsonField(initialData.risks_and_watchouts as any, []),
      success_criteria: parseJsonField(initialData.success_criteria as any, []),
      status: initialData.status || 'planned',
      order: initialData.order || 1,
      key_messages_summary: (initialData.key_messages_summary as string) || '',
      suggested_weekly_post_volume: (initialData.suggested_weekly_post_volume as { total_posts_per_week?: number; video_posts_per_week?: number; stories_per_week?: number } | null) || null,
    }
  }

  const [formData, setFormData] = useState<SprintFormData>(getInitialFormData)

  // Update formData immediately when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('🔄 SprintForm: initialData changed', {
        hasInitialData: !!initialData,
        sprintId: initialData?.id,
        initialDataKeys: initialData ? Object.keys(initialData) : [],
        success_indicators: initialData?.success_indicators,
        success_indicators_type: typeof initialData?.success_indicators,
        success_indicators_isArray: Array.isArray(initialData?.success_indicators),
        success_indicators_length: Array.isArray(initialData?.success_indicators) ? initialData.success_indicators.length : 'N/A',
        risks_and_watchouts: initialData?.risks_and_watchouts,
        success_criteria: initialData?.success_criteria,
      })

      const newFormData = getInitialFormData()
      console.log('✅ SprintForm: Setting formData', {
        success_indicators: newFormData.success_indicators,
        success_indicators_length: newFormData.success_indicators.length,
        risks_and_watchouts: newFormData.risks_and_watchouts,
        risks_and_watchouts_length: newFormData.risks_and_watchouts.length,
        success_criteria: newFormData.success_criteria,
        success_criteria_length: newFormData.success_criteria.length,
      })
      setFormData(newFormData)
    }
  }, [initialData]) // Re-run when initialData object reference changes

  // Load segments, topics, channels, and junction table relationships
  useEffect(() => {
    async function loadAllData() {
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      // Load segments and topics first (needed for dropdowns)
      const [segmentsResult, topicsResult] = await Promise.all([
        db.from('segments').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }),
        db.from('topics').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }),
      ])

      if (segmentsResult.data) {
        setSegments(segmentsResult.data)
      }

      if (topicsResult.data) {
        setTopics(topicsResult.data)
      }

      // Load campaign channels
      const { data: campaignChannels } = await db
        .from('campaign_channels')
        .select('channels(name)')
        .eq('campaign_id', campaignId)

      const campaignChannelNames = (campaignChannels || [])
        .map((cc: any) => cc.channels?.name)
        .filter((name: string | undefined): name is string => !!name)

      if (campaignChannelNames.length > 0) {
        setChannels(campaignChannelNames)
      } else {
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

      // Load junction table relationships if editing
      if (initialData?.id) {
        const [segmentsResult, topicsResult, channelsResult] = await Promise.all([
          db.from('sprint_segments').select('segment_id, priority').eq('sprint_id', initialData.id),
          db.from('sprint_topics').select('topic_id, priority').eq('sprint_id', initialData.id),
          db.from('sprint_channels').select('channel_key, priority').eq('sprint_id', initialData.id),
        ])

        const segmentMap = categorizeByPriority(segmentsResult.data || [], 'segment_id')
        const topicMap = categorizeByPriority(topicsResult.data || [], 'topic_id')
        const channelMap = categorizeByPriority(channelsResult.data || [], 'channel_key')

        setFormData(prev => ({
          ...prev,
          focus_segments_primary: segmentMap.primary,
          focus_segments_secondary: segmentMap.secondary,
          focus_topics_primary: topicMap.primary,
          focus_topics_secondary: topicMap.secondary,
          focus_channels_primary: channelMap.primary,
          focus_channels_secondary: channelMap.secondary,
        }))
      }
    }

    loadAllData()
  }, [campaignId, initialData?.id]) // Re-run when campaignId or sprint ID changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate dates
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setError('A befejezési dátumnak a kezdési dátum után kell lennie')
        setIsLoading(false)
        return
      }

      // Validate required fields
      if (!formData.name.trim()) {
        setError('A sprint neve kötelező')
        setIsLoading(false)
        return
      }

      const focusSegmentsPrimary = formData.focus_segments_primary
      const focusTopicsPrimary = formData.focus_topics_primary
      const focusChannelsPrimary = formData.focus_channels_primary
      const focusSegmentsSecondary = formData.focus_segments_secondary
      const focusTopicsSecondary = formData.focus_topics_secondary
      const focusChannelsSecondary = formData.focus_channels_secondary

      const errorMessages = [
        ensureCount('Fő szegmensek', focusSegmentsPrimary, 1, 2),
        ensureCount('Fő témák', focusTopicsPrimary, 2, 3),
        ensureCount('Fő csatornák', focusChannelsPrimary, 2, 3),
      ]

      if (focusTopicsSecondary.length > 0) {
        if (focusTopicsSecondary.length < 2) {
          errorMessages.push('Kiegészítő témák esetén legalább 2 elemet kell megadni')
        } else if (focusTopicsSecondary.length > 4) {
          errorMessages.push('Kiegészítő témák legfeljebb 4 elemet tartalmazhatnak')
        }
      }

      const errorMessage = errorMessages.find(Boolean)
      if (errorMessage) {
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const url = '/api/sprints'
      const method = initialData ? 'PUT' : 'POST'
      const focusSegmentsCombined = [
        ...formData.focus_segments_primary,
        ...formData.focus_segments_secondary,
      ]
      const focusTopicsCombined = [
        ...formData.focus_topics_primary,
        ...formData.focus_topics_secondary,
      ]
      const focusChannelsCombined = [
        ...formData.focus_channels_primary,
        ...formData.focus_channels_secondary,
      ]

      const body = {
        ...formData,
        focus_segments_primary: formData.focus_segments_primary,
        focus_segments_secondary: formData.focus_segments_secondary,
        focus_topics_primary: formData.focus_topics_primary,
        focus_topics_secondary: formData.focus_topics_secondary,
        focus_channels_primary: formData.focus_channels_primary,
        focus_channels_secondary: formData.focus_channels_secondary,
        focus_segments: focusSegmentsCombined,
        focus_topics: focusTopicsCombined,
        focus_channels: focusChannelsCombined,
        campaign_id: campaignId,
        id: initialData?.id,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sprint')
      }

      router.refresh()
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the sprint.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !confirm('Are you sure you want to delete this sprint?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/sprints?id=${initialData.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete sprint')
      }

      router.refresh()
      onSuccess()
    } catch (err) {
      setError('Failed to delete sprint')
      console.error(err)
    } finally {
      setIsLoading(false)
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
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
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
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Befejezési dátum *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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

      <div className="grid gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2 tracking-wide">
            Szegmensek
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Fő szegmensek <span className="text-xs text-gray-500">(1-2 fő)</span>
              </Label>
              <MultiSelect
                options={segments.map((s) => ({
                  value: s.id,
                  label: s.name,
                  description: s.description || undefined,
                }))}
                selected={formData.focus_segments_primary}
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, focus_segments_primary: selected })
                }
                placeholder="Válassz fő szegmenseket..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Kiegészítő szegmensek{' '}
                <span className="text-xs text-gray-500">(0-2 darab, opcionális)</span>
              </Label>
              <MultiSelect
                options={segments.map((s) => ({
                  value: s.id,
                  label: s.name,
                  description: s.description || undefined,
                }))}
                selected={formData.focus_segments_secondary}
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, focus_segments_secondary: selected })
                }
                placeholder="Válassz kiegészítő szegmenseket..."
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2 tracking-wide">
            Témák
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Fő témák <span className="text-xs text-gray-500">(2-3 fő)</span>
              </Label>
              <MultiSelect
                options={topics.map((t) => ({
                  value: t.id,
                  label: t.name,
                  description: t.description || undefined,
                }))}
                selected={formData.focus_topics_primary}
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, focus_topics_primary: selected })
                }
                placeholder="Válassz fő témákat..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Kiegészítő témák{' '}
                <span className="text-xs text-gray-500">(2-4 darab, opcionális)</span>
              </Label>
              <MultiSelect
                options={topics.map((t) => ({
                  value: t.id,
                  label: t.name,
                  description: t.description || undefined,
                }))}
                selected={formData.focus_topics_secondary}
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, focus_topics_secondary: selected })
                }
                placeholder="Válassz kiegészítő témákat..."
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2 tracking-wide">
            Csatornák
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Fő csatornák <span className="text-xs text-gray-500">(2-3 fő)</span>
              </Label>
              <MultiSelect
                options={channels.map((c) => ({
                  value: c,
                  label: c,
                }))}
                selected={formData.focus_channels_primary}
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, focus_channels_primary: selected })
                }
                placeholder="Válassz fő csatornákat..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Kiegészítő csatornák{' '}
                <span className="text-xs text-gray-500">(opcionális)</span>
              </Label>
              <MultiSelect
                options={channels.map((c) => ({
                  value: c,
                  label: c,
                }))}
                selected={formData.focus_channels_secondary}
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, focus_channels_secondary: selected })
                }
                placeholder="Válassz kiegészítő csatornákat..."
              />
            </div>
          </div>
        </div>
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

      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-semibold">Ajánlott heti poszt mennyiség</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_posts_per_week">Összes poszt/hét</Label>
            <Input
              id="total_posts_per_week"
              type="number"
              min="0"
              value={formData.suggested_weekly_post_volume?.total_posts_per_week || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  suggested_weekly_post_volume: {
                    ...formData.suggested_weekly_post_volume,
                    total_posts_per_week: e.target.value ? parseInt(e.target.value) : undefined,
                  } as { total_posts_per_week?: number; video_posts_per_week?: number; stories_per_week?: number },
                })
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_posts_per_week">Videó posztok/hét</Label>
            <Input
              id="video_posts_per_week"
              type="number"
              min="0"
              value={formData.suggested_weekly_post_volume?.video_posts_per_week || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  suggested_weekly_post_volume: {
                    ...formData.suggested_weekly_post_volume,
                    video_posts_per_week: e.target.value ? parseInt(e.target.value) : undefined,
                  } as { total_posts_per_week?: number; video_posts_per_week?: number; stories_per_week?: number },
                })
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stories_per_week">Storyk/hét</Label>
            <Input
              id="stories_per_week"
              type="number"
              min="0"
              value={formData.suggested_weekly_post_volume?.stories_per_week || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  suggested_weekly_post_volume: {
                    ...formData.suggested_weekly_post_volume,
                    stories_per_week: e.target.value ? parseInt(e.target.value) : undefined,
                  } as { total_posts_per_week?: number; video_posts_per_week?: number; stories_per_week?: number },
                })
              }}
              placeholder="0"
            />
          </div>
        </div>
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
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-4 pb-6">
        {initialData ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        ) : (
          <div></div>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Mégse
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Mentés...' : 'Mentés'}
          </Button>
        </div>
      </div>
    </form>
    </div>
  )
}
