'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SprintPlan, ContentSlot } from '@/lib/ai/schemas'
import { ContentCalendar } from './ContentCalendar'
import SprintForm from '../sprints/SprintForm'
import { ArrowLeft, Calendar, Target, Users, MessageSquare, Radio, Edit, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { toast } from 'sonner'

type Sprint = Database['campaign_os']['Tables']['sprints']['Row']

interface SprintDetailPageProps {
  campaignId: string
  sprintId: string
}

const focusGoalLabels: Record<string, string> = {
  awareness: 'Tudatosság',
  engagement: 'Engedélyezés',
  consideration: 'Fontolgatás',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const focusGoalColors: Record<string, string> = {
  awareness: 'bg-blue-100 text-blue-700 border-blue-200',
  engagement: 'bg-green-100 text-green-700 border-green-200',
  consideration: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  conversion: 'bg-purple-100 text-purple-700 border-purple-200',
  mobilization: 'bg-red-100 text-red-700 border-red-200',
}

export function SprintDetailPage({ campaignId, sprintId }: SprintDetailPageProps) {
  const router = useRouter()
  const [sprint, setSprint] = useState<SprintPlan | null>(null)
  const [contentSlots, setContentSlots] = useState<ContentSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [segmentNames, setSegmentNames] = useState<Record<string, string>>({})
  const [topicNames, setTopicNames] = useState<Record<string, string>>({})

  const getSegmentLabel = (id: string) => segmentNames[id] || id
  const getTopicLabel = (id: string) => topicNames[id] || id

  const renderFocusSplit = (
    title: string,
    primaryItems: string[],
    secondaryItems: string[],
    labelFn: (value: string) => string
  ) => (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="space-y-2 text-xs text-gray-600">
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Fő {title.toLowerCase()}</p>
          <div className="flex flex-wrap gap-2">
            {primaryItems.length > 0 ? (
              primaryItems.map((item) => (
                <Badge
                  key={`${title}-primary-${item}`}
                  variant="outline"
                  className="text-xs font-semibold text-primary-700 border-primary-200/70 bg-primary-50"
                >
                  {labelFn(item)}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400">Nincs megadva</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Kiegészítő {title.toLowerCase()}</p>
          <div className="flex flex-wrap gap-2">
            {secondaryItems.length > 0 ? (
              secondaryItems.map((item) => (
                <Badge
                  key={`${title}-secondary-${item}`}
                  variant="outline"
                  className="text-xs text-slate-600 border-slate-200/80 bg-slate-50"
                >
                  {labelFn(item)}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400">Nem került megadásra</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Load sprint data and content slots
  const categorizeByPriority = (
    rows: { priority: string | null; [key: string]: string | null }[] = [],
    keyField: string
  ) => {
    const primary: string[] = []
    const secondary: string[] = []
    rows.forEach((row) => {
      const value = row[keyField]
      if (!value) return
      const priority = row.priority === 'secondary' ? 'secondary' : 'primary'
      if (priority === 'secondary') {
        secondary.push(value)
      } else {
        primary.push(value)
      }
    })
    return { primary, secondary }
  }

  useEffect(() => {
    async function loadSprintData() {
      try {
        setIsLoading(true)
        const supabase = createClient()
        const db = supabase.schema('campaign_os')

        // Load sprint from database
        const { data: sprintData, error: sprintError } = await db
          .from('sprints')
          .select('*')
          .eq('id', sprintId)
          .single()

        if (sprintError || !sprintData) {
          toast.error('Sprint betöltése sikertelen')
          return
        }

        // Load junction table data (segments, topics, channels)
        const { data: sprintSegments } = await db
          .from('sprint_segments')
          .select('segment_id, priority')
          .eq('sprint_id', sprintId)

        const { data: sprintTopics } = await db
          .from('sprint_topics')
          .select('topic_id, priority')
          .eq('sprint_id', sprintId)

        const { data: sprintChannels } = await db
          .from('sprint_channels')
          .select('channel_key, priority')
          .eq('sprint_id', sprintId)

        const segmentPriority = categorizeByPriority(sprintSegments || [], 'segment_id')
        const topicPriority = categorizeByPriority(sprintTopics || [], 'topic_id')
        const channelPriority = categorizeByPriority(sprintChannels || [], 'channel_key')

        // Convert to SprintPlan format
        const sprintPlan: SprintPlan = {
          id: sprintData.id,
          name: sprintData.name,
          order: sprintData.order,
          start_date: sprintData.start_date,
          end_date: sprintData.end_date,
          focus_goal: (sprintData.focus_goal as any) || undefined,
          focus_description: sprintData.focus_description || undefined,
          focus_segments_primary: segmentPriority.primary,
          focus_segments_secondary: segmentPriority.secondary,
          focus_topics_primary: topicPriority.primary,
          focus_topics_secondary: topicPriority.secondary,
          focus_channels_primary: channelPriority.primary,
          focus_channels_secondary: channelPriority.secondary,
          focus_stage: (sprintData.focus_stage as any) || undefined,
          focus_goals: sprintData.focus_goals as string[] || undefined,
          suggested_weekly_post_volume: sprintData.suggested_weekly_post_volume as any || undefined,
          narrative_emphasis: sprintData.narrative_emphasis as string[] || undefined,
          key_messages_summary: sprintData.key_messages_summary || undefined,
          success_criteria: sprintData.success_criteria as string[] || undefined,
          risks_and_watchouts: sprintData.risks_and_watchouts as string[] || undefined,
        }

        setSprint(sprintPlan)

        // Load content slots for this sprint
        const { data: slots } = await db
          .from('content_slots')
          .select('*')
          .eq('sprint_id', sprintId)

        if (slots) {
          const contentSlots: ContentSlot[] = slots.map(slot => ({
            id: slot.id,
            sprint_id: slot.sprint_id,
            date: slot.date,
            channel: slot.channel,
            slot_index: slot.slot_index,
            primary_segment_id: slot.primary_segment_id || undefined,
            primary_topic_id: slot.primary_topic_id || undefined,
            objective: slot.objective as any,
            content_type: slot.content_type as any,
            angle_hint: slot.angle_hint || undefined,
            notes: slot.notes || undefined,
            status: (slot.status as any) || 'planned',
          }))
          setContentSlots(contentSlots)
        }

        // Load segment and topic names
        const segmentIds = [...(sprintPlan.focus_segments_primary || []), ...(sprintPlan.focus_segments_secondary || [])]
        const topicIds = [...(sprintPlan.focus_topics_primary || []), ...(sprintPlan.focus_topics_secondary || [])]

        if (segmentIds.length > 0) {
          const { data: segments } = await db
            .from('segments')
            .select('id, name')
            .in('id', segmentIds)

          if (segments) {
            const names: Record<string, string> = {}
            segments.forEach(seg => {
              names[seg.id] = seg.name
            })
            setSegmentNames(names)
          }
        }

        if (topicIds.length > 0) {
          const { data: topics } = await db
            .from('topics')
            .select('id, name')
            .in('id', topicIds)

          if (topics) {
            const names: Record<string, string> = {}
            topics.forEach(topic => {
              names[topic.id] = topic.name
            })
            setTopicNames(names)
          }
        }
      } catch (error) {
        console.error('Error loading sprint data:', error)
        toast.error('Hiba történt az adatok betöltése során')
      } finally {
        setIsLoading(false)
      }
    }

    loadSprintData()
  }, [sprintId])

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true)
    setProgress('')

    try {
      const response = await fetch(`/api/ai/campaign-sprints/${sprintId}/content-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error('Hiba történt a tartalomnaptár generálás során')
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
              } else if (data.type === 'warning') {
                toast.warning(data.message || 'Figyelmeztetés')
              } else if (data.type === 'done') {
                // Reload content slots
                await loadContentSlots()
                setProgress('')
                setIsGeneratingContent(false)
                toast.success('Tartalomnaptár sikeresen generálva')
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Ismeretlen hiba')
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt'
      setIsGeneratingContent(false)
      toast.error(errorMessage)
    }
  }

  const loadContentSlots = async () => {
    const supabase = createClient()
    const db = supabase.schema('campaign_os')

    const { data: slots } = await db
      .from('content_slots')
      .select('*')
      .eq('sprint_id', sprintId)

    if (slots) {
      const contentSlots: ContentSlot[] = slots.map(slot => ({
        id: slot.id,
        sprint_id: slot.sprint_id,
        date: slot.date,
        channel: slot.channel,
        slot_index: slot.slot_index,
        primary_segment_id: slot.primary_segment_id || undefined,
        primary_topic_id: slot.primary_topic_id || undefined,
        objective: slot.objective as any,
        content_type: slot.content_type as any,
        angle_hint: slot.angle_hint || undefined,
        notes: slot.notes || undefined,
        status: (slot.status as any) || 'planned',
      }))
      setContentSlots(contentSlots)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Sprint nem található</p>
        <Button onClick={() => router.push(`/campaigns/${campaignId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza a kampányhoz
        </Button>
      </div>
    )
  }

  const startDate = new Date(sprint.start_date)
  const endDate = new Date(sprint.end_date)

  const segmentsPrimary = sprint.focus_segments_primary ?? []
  const segmentsSecondary = sprint.focus_segments_secondary ?? []
  const topicsPrimary = sprint.focus_topics_primary ?? []
  const topicsSecondary = sprint.focus_topics_secondary ?? []
  const channelsPrimary = sprint.focus_channels_primary ?? []
  const channelsSecondary = sprint.focus_channels_secondary ?? []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza a kampányhoz
          </Button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl font-display font-bold text-gray-900">
                    {sprint.name}
                  </h1>
                  <Badge
                    className={`${focusGoalColors[sprint.focus_goal || sprint.focus_stage || 'awareness'] || 'bg-gray-100 text-gray-700 border-gray-200'} border`}
                  >
                    {focusGoalLabels[sprint.focus_goal || sprint.focus_stage || 'awareness'] || sprint.focus_goal || sprint.focus_stage || 'awareness'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(startDate, 'yyyy.MM.dd')} - {format(endDate, 'yyyy.MM.dd')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{segmentsPrimary.length + segmentsSecondary.length} szegmens</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{topicsPrimary.length + topicsSecondary.length} téma</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4" />
                    <span>{channelsPrimary.length + channelsSecondary.length} csatorna</span>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingSettings(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Szerkesztés
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sprint Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
              Sprint Részletek
            </h3>
            
            {sprint.focus_description && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Leírás
                </p>
                <p className="text-sm text-gray-700">{sprint.focus_description}</p>
              </div>
            )}

            {sprint.key_messages_summary && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Kulcs Üzenetek
                </p>
                <p className="text-sm text-gray-700">{sprint.key_messages_summary}</p>
              </div>
            )}

            {sprint.suggested_weekly_post_volume && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Javasolt Heti Poszt Mennyiség
                </p>
                <div className="flex gap-4 text-sm text-gray-700">
                  <span>Összes: {sprint.suggested_weekly_post_volume.total_posts_per_week}</span>
                  <span>Videó: {sprint.suggested_weekly_post_volume.video_posts_per_week}</span>
                  {sprint.suggested_weekly_post_volume.stories_per_week && (
                    <span>Story: {sprint.suggested_weekly_post_volume.stories_per_week}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
              Fókusz Területek
            </h3>

            <div className="space-y-6">
              {renderFocusSplit('Szegmensek', segmentsPrimary, segmentsSecondary, getSegmentLabel)}
              {renderFocusSplit('Témák', topicsPrimary, topicsSecondary, getTopicLabel)}
              {renderFocusSplit('Csatornák', channelsPrimary, channelsSecondary, (value) => value)}
            </div>
          </div>
        </div>

        {/* Content Calendar Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-gray-900">
                Tartalomnaptár
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {contentSlots.length > 0
                  ? `${contentSlots.length} tartalom slot generálva`
                  : 'Még nincs tartalomnaptár generálva'}
              </p>
            </div>

            {contentSlots.length === 0 && (
              <Button
                onClick={handleGenerateContent}
                disabled={isGeneratingContent}
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generálás...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Tartalomnaptár generálása
                  </>
                )}
              </Button>
            )}
          </div>

          {isGeneratingContent && progress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                <p className="text-sm font-medium text-gray-900">{progress}</p>
              </div>
            </div>
          )}

          {contentSlots.length > 0 && sprint && (
            <ContentCalendar
              slots={contentSlots}
              sprints={[sprint]}
              campaignId={campaignId}
              onSlotUpdate={loadContentSlots}
            />
          )}
        </div>
      </div>

      {/* Edit Form Dialog */}
      {isEditingSettings && sprint && (
        <Dialog open={true} onOpenChange={() => setIsEditingSettings(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sprint szerkesztése</DialogTitle>
            </DialogHeader>
            <SprintForm
              campaignId={campaignId}
              initialData={sprint as any}
              onSuccess={() => {
                setIsEditingSettings(false)
                window.location.reload()
              }}
              onCancel={() => setIsEditingSettings(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
