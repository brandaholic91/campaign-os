'use client'

import React, { useState, useMemo } from 'react'
import { ContentSlot, SprintPlan } from '@/lib/ai/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, Edit, Trash2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ContentSlotEditForm } from './ContentSlotEditForm'
import { Database } from '@/lib/supabase/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type ContentSlotRow = Database['campaign_os']['Tables']['content_slots']['Row']

interface ContentCalendarProps {
  slots: ContentSlot[]
  sprints: SprintPlan[]
  campaignId?: string
  onSlotUpdate?: () => void
}

const objectiveLabels: Record<string, string> = {
  reach: 'Elérés',
  engagement: 'Engedélyezés',
  traffic: 'Forgalom',
  lead: 'Lead',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const contentTypeLabels: Record<string, string> = {
  short_video: 'Rövid videó',
  story: 'Story',
  static_image: 'Statikus kép',
  carousel: 'Karruszel',
  live: 'Élő',
  long_post: 'Hosszú poszt',
  email: 'Email',
}

const objectiveColors: Record<string, string> = {
  reach: 'bg-blue-100 text-blue-700 border-blue-200',
  engagement: 'bg-green-100 text-green-700 border-green-200',
  traffic: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  lead: 'bg-purple-100 text-purple-700 border-purple-200',
  conversion: 'bg-orange-100 text-orange-700 border-orange-200',
  mobilization: 'bg-red-100 text-red-700 border-red-200',
}

const draftStatusLabels: Record<string, string> = {
  no_draft: 'Nincs draft',
  has_draft: 'Van draft',
  approved: 'Jóváhagyva',
  published: 'Publikálva',
}

const draftStatusColors: Record<string, string> = {
  no_draft: 'bg-gray-100 text-gray-600 border-gray-200',
  has_draft: 'bg-blue-50 text-blue-600 border-blue-200',
  approved: 'bg-green-50 text-green-600 border-green-200',
  published: 'bg-purple-50 text-purple-600 border-purple-200',
}

type ViewType = 'weekly' | 'monthly' | 'sprint'

export function ContentCalendar({ slots, sprints, campaignId, onSlotUpdate }: ContentCalendarProps) {
  const router = useRouter()
  const [viewType, setViewType] = useState<ViewType>('weekly')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [segmentNames, setSegmentNames] = useState<Record<string, string>>({})
  const [topicNames, setTopicNames] = useState<Record<string, string>>({})
  const [editingSlot, setEditingSlot] = useState<ContentSlotRow | null>(null)
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null)

  // Load segment and topic names
  React.useEffect(() => {
    async function loadNames() {
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      const segmentIds = new Set<string>()
      const topicIds = new Set<string>()
      
      slots.forEach(slot => {
        if (slot.primary_segment_id) segmentIds.add(slot.primary_segment_id)
        if (slot.primary_topic_id) topicIds.add(slot.primary_topic_id)
      })

      if (segmentIds.size > 0) {
        const { data: segments } = await db
          .from('segments')
          .select('id, name')
          .in('id', Array.from(segmentIds))

        if (segments) {
          const names: Record<string, string> = {}
          segments.forEach(seg => {
            names[seg.id] = seg.name
          })
          setSegmentNames(names)
        }
      }

      if (topicIds.size > 0) {
        const { data: topics } = await db
          .from('topics')
          .select('id, name')
          .in('id', Array.from(topicIds))

        if (topics) {
          const names: Record<string, string> = {}
          topics.forEach(topic => {
            names[topic.id] = topic.name
          })
          setTopicNames(names)
        }
      }
    }

    loadNames()
  }, [slots])

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, ContentSlot[]> = {}
    slots.forEach(slot => {
      const dateKey = slot.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })
    return grouped
  }, [slots])

  // Group slots by sprint
  const slotsBySprint = useMemo(() => {
    const grouped: Record<string, ContentSlot[]> = {}
    slots.forEach(slot => {
      if (!grouped[slot.sprint_id]) {
        grouped[slot.sprint_id] = []
      }
      grouped[slot.sprint_id].push(slot)
    })
    return grouped
  }, [slots])

  // Get sprint name by ID
  const getSprintName = (sprintId: string) => {
    return sprints.find(s => s.id === sprintId)?.name || sprintId
  }

  // Weekly view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentWeek])

  // Monthly view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Add padding days for calendar grid
    const firstDay = monthStart.getDay()
    const paddingStart = firstDay === 0 ? 6 : firstDay - 1
    const paddingDays: Date[] = []
    for (let i = 0; i < paddingStart; i++) {
      paddingDays.push(new Date(monthStart.getTime() - (paddingStart - i) * 24 * 60 * 60 * 1000))
    }
    
    return [...paddingDays, ...days]
  }, [currentMonth])

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(new Date(currentWeek.getTime() + (direction === 'next' ? 7 : -7) * 24 * 60 * 60 * 1000))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const handleEdit = async (slotId: string) => {
    if (!campaignId) {
      toast.error('Kampány ID hiányzik')
      return
    }

    const supabase = createClient()
    const db = supabase.schema('campaign_os')

    const { data: slot, error } = await db
      .from('content_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (error || !slot) {
      toast.error('Tartalom slot betöltése sikertelen')
      return
    }

    setEditingSlot(slot)
  }

  const handleDelete = async (slotId: string) => {
    setDeletingSlotId(slotId)
  }

  const confirmDelete = async () => {
    if (!deletingSlotId) return

    try {
      const response = await fetch(`/api/content-slots/${deletingSlotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Sikertelen törlés')
      }

      toast.success('Tartalom slot sikeresen törölve')
      setDeletingSlotId(null)
      if (onSlotUpdate) {
        onSlotUpdate()
      }
    } catch (error) {
      toast.error('Hiba történt a törlés során')
      console.error('Error deleting content slot:', error)
    }
  }

  const handleEditSuccess = () => {
    setEditingSlot(null)
    if (onSlotUpdate) {
      onSlotUpdate()
    }
  }

  const renderSlot = (slot: ContentSlot) => {
    // Convert ContentSlot to ContentSlotRow format for editing
    const slotRow: ContentSlotRow = {
      id: slot.id,
      sprint_id: slot.sprint_id,
      campaign_id: slot.campaign_id,
      date: slot.date,
      channel: slot.channel,
      slot_index: slot.slot_index,
      primary_segment_id: slot.primary_segment_id!,
      primary_topic_id: slot.primary_topic_id!,
      objective: slot.objective,
      content_type: slot.content_type,
      funnel_stage: slot.funnel_stage,
      angle_type: slot.angle_type,
      cta_type: slot.cta_type,
      related_goal_ids: slot.related_goal_ids,
      angle_hint: slot.angle_hint || null,
      notes: slot.notes || null,
      status: slot.status,
      secondary_segment_ids: slot.secondary_segment_ids || null,
      secondary_topic_ids: slot.secondary_topic_ids || null,
      time_of_day: slot.time_of_day || null,
      tone_override: slot.tone_override || null,
      asset_requirements: null,
      owner: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return (
      <div
        key={slot.id}
        onClick={() => campaignId && router.push(`/campaigns/${campaignId}/sprints/${slot.sprint_id}/slots/${slot.id}`)}
        className="p-2 bg-white border border-gray-200 rounded-lg mb-2 hover:shadow-md transition-shadow cursor-pointer group relative"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={`${objectiveColors[slot.objective] || 'bg-gray-100 text-gray-700 border-gray-200'} border text-xs`}
            >
              {objectiveLabels[slot.objective] || slot.objective}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {slot.channel}
            </Badge>
            {slot.draft_status && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${draftStatusColors[slot.draft_status]}`}>
                {draftStatusLabels[slot.draft_status]}
              </Badge>
            )}
          </div>
          {campaignId && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(slot.id)
                }}
                title="Szerkesztés"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(slot.id)
                }}
                title="Törlés"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600 space-y-0.5">
          {slot.primary_segment_id && (
            <div className="truncate">
              Szegmens: {segmentNames[slot.primary_segment_id] || slot.primary_segment_id}
            </div>
          )}
          {slot.primary_topic_id && (
            <div className="truncate">
              Téma: {topicNames[slot.primary_topic_id] || slot.primary_topic_id}
            </div>
          )}
          <div className="text-gray-500">
            {contentTypeLabels[slot.content_type] || slot.content_type}
          </div>
          {slot.angle_hint && (
            <div className="text-gray-500 truncate" title={slot.angle_hint}>
              {slot.angle_hint.length > 30 ? `${slot.angle_hint.substring(0, 30)}...` : slot.angle_hint}
            </div>
          )}
          {slot.funnel_stage && (
             <div className="flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                  {slot.funnel_stage}
                </Badge>
             </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-gray-900">
              Tartalomnaptár
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {slots.length} slot generálva
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('weekly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewType === 'weekly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Heti
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewType === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Havi
            </button>
            <button
              onClick={() => setViewType('sprint')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewType === 'sprint'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sprint
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        {viewType === 'weekly' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="text-sm font-semibold text-gray-900">
                {format(weekDays[0], 'yyyy.MM.dd')} - {format(weekDays[6], 'yyyy.MM.dd')}
              </h4>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const daySlots = slotsByDate[dateKey] || []
                return (
                  <div key={idx} className="border border-gray-200 rounded-lg p-2 min-h-[200px]">
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      {format(day, 'EEE d')}
                    </div>
                    <div className="space-y-1">
                      {daySlots.map(renderSlot)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewType === 'monthly' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="text-sm font-semibold text-gray-900">
                {format(currentMonth, 'yyyy MMMM')}
              </h4>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['H', 'K', 'Sz', 'Cs', 'P', 'Szo', 'V'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-xs font-semibold text-gray-500 text-center py-2">
                  {day}
                </div>
              ))}
              {monthDays.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const daySlots = slotsByDate[dateKey] || []
                const isCurrentMonth = isSameMonth(day, currentMonth)
                return (
                  <div
                    key={idx}
                    className={`border border-gray-200 rounded-lg p-1.5 min-h-[120px] ${
                      !isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {daySlots.slice(0, 2).map(renderSlot)}
                      {daySlots.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{daySlots.length - 2} további
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewType === 'sprint' && (
          <div className="space-y-6">
            {sprints
              .sort((a, b) => a.order - b.order)
              .map(sprint => {
                const sprintSlots = slotsBySprint[sprint.id] || []
                return (
                  <div key={sprint.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-3">
                      {sprint.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sprintSlots.map(renderSlot)}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Edit Form Dialog */}
      {editingSlot && campaignId && (
        <ContentSlotEditForm
          slot={editingSlot}
          sprintId={editingSlot.sprint_id}
          campaignId={campaignId}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingSlot(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingSlotId !== null} onOpenChange={() => setDeletingSlotId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Törlés megerősítése</DialogTitle>
            <DialogDescription>
              Biztosan törölni szeretnéd ezt a tartalom slotot?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSlotId(null)}>
              Mégse
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

