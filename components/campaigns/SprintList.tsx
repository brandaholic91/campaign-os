'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SprintPlan } from '@/lib/ai/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Calendar, Target, Users, MessageSquare, Radio, Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import SprintForm from '../sprints/SprintForm'
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

type Sprint = Database['campaign_os']['Tables']['sprints']['Row'] & {
  focus_segments?: string[]
  focus_topics?: string[]
  focus_channels?: string[]
  success_indicators?: any[]
}

interface SprintListProps {
  sprints: SprintPlan[]
  campaignId?: string
  onSprintUpdate?: () => void
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

export function SprintList({ sprints, campaignId, onSprintUpdate }: SprintListProps) {
  const router = useRouter()
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set())
  const [segmentNames, setSegmentNames] = useState<Record<string, string>>({})
  const [topicNames, setTopicNames] = useState<Record<string, string>>({})
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null)

  // Load segment and topic names
  React.useEffect(() => {
    async function loadNames() {
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      // Get all unique segment and topic IDs
      const segmentIds = new Set<string>()
      const topicIds = new Set<string>()
      
      sprints.forEach(sprint => {
        const segPrimary = sprint.focus_segments_primary ?? []
        const segSecondary = sprint.focus_segments_secondary ?? []
        const topicPrimary = sprint.focus_topics_primary ?? []
        const topicSecondary = sprint.focus_topics_secondary ?? []
        segPrimary.forEach(id => segmentIds.add(id))
        segSecondary.forEach(id => segmentIds.add(id))
        topicPrimary.forEach(id => topicIds.add(id))
        topicSecondary.forEach(id => topicIds.add(id))
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
  }, [sprints])

  const handleEdit = async (sprintId: string) => {
    if (!campaignId) {
      toast.error('Kampány ID hiányzik')
      return
    }

    // First, try to find the sprint in the preview list (SprintPlan)
    const sprintPlan = sprints.find(s => s.id === sprintId)
    
    if (sprintPlan) {
      // Convert SprintPlan to Sprint format for editing
      // Store focus_segments and focus_topics in a way that SprintEditForm can access them
      const sprintForEdit: Sprint & { _focus_segments?: string[], _focus_topics?: string[] } = {
        id: sprintPlan.id,
        campaign_id: campaignId,
        name: sprintPlan.name,
        order: sprintPlan.order,
        start_date: sprintPlan.start_date,
        end_date: sprintPlan.end_date,
        focus_goal: sprintPlan.focus_goal || 'awareness', // Default fallback for backward compatibility
        focus_description: sprintPlan.focus_description || '', // Default fallback for backward compatibility
        focus_channels: [...(sprintPlan.focus_channels_primary || []), ...(sprintPlan.focus_channels_secondary || [])] as any,
        success_indicators: sprintPlan.success_indicators as any,
        status: 'planned' as const,
        created_at: null, // null indicates this sprint is not yet saved to database
        // Enhanced fields (Phase 2) - all optional with defaults
        focus_stage: sprintPlan.focus_stage || null,
        focus_goals: (sprintPlan.focus_goals || []) as any,
        suggested_weekly_post_volume: sprintPlan.suggested_weekly_post_volume as any || null,
        narrative_emphasis: (sprintPlan.narrative_emphasis || []) as any,
        key_messages_summary: sprintPlan.key_messages_summary || null,
        success_criteria: (sprintPlan.success_criteria || []) as any,
        risks_and_watchouts: (sprintPlan.risks_and_watchouts || []) as any,
        updated_at: null,
        _focus_segments: [...(sprintPlan.focus_segments_primary || []), ...(sprintPlan.focus_segments_secondary || [])], // Temporary field for unsaved sprints
        _focus_topics: [...(sprintPlan.focus_topics_primary || []), ...(sprintPlan.focus_topics_secondary || [])], // Temporary field for unsaved sprints
      }
      
      setEditingSprint(sprintForEdit as Sprint)
      return
    }

    // If not found in preview, try to load from database
    const supabase = createClient()
    const db = supabase.schema('campaign_os')

    const { data: sprint, error } = await db
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .single()

    if (error || !sprint) {
      toast.error('Sprint betöltése sikertelen')
      return
    }

    // Load junction table data to get segments, topics, channels
    const [segmentsResult, topicsResult, channelsResult] = await Promise.all([
      db.from('sprint_segments').select('segment_id, priority').eq('sprint_id', sprintId),
      db.from('sprint_topics').select('topic_id, priority').eq('sprint_id', sprintId),
      db.from('sprint_channels').select('channel_key, priority').eq('sprint_id', sprintId),
    ])

    const segmentsPrimary: string[] = []
    const segmentsSecondary: string[] = []
    const topicsPrimary: string[] = []
    const topicsSecondary: string[] = []
    const channelsPrimary: string[] = []
    const channelsSecondary: string[] = []

    ;(segmentsResult.data || []).forEach((row: any) => {
      if (row.priority === 'secondary') {
        segmentsSecondary.push(row.segment_id)
      } else {
        segmentsPrimary.push(row.segment_id)
      }
    })

    ;(topicsResult.data || []).forEach((row: any) => {
      if (row.priority === 'secondary') {
        topicsSecondary.push(row.topic_id)
      } else {
        topicsPrimary.push(row.topic_id)
      }
    })

    ;(channelsResult.data || []).forEach((row: any) => {
      if (row.priority === 'secondary') {
        channelsSecondary.push(row.channel_key)
      } else {
        channelsPrimary.push(row.channel_key)
      }
    })

    // Convert to Sprint format with proper types
    const sprintForEdit: Sprint = {
      ...sprint,
      focus_segments: [...segmentsPrimary, ...segmentsSecondary],
      focus_topics: [...topicsPrimary, ...topicsSecondary],
      focus_channels: [...channelsPrimary, ...channelsSecondary],
      success_indicators: Array.isArray(sprint.success_indicators) ? sprint.success_indicators : [],
    } as Sprint

    setEditingSprint(sprintForEdit)
  }

  const handleDelete = async (sprintId: string) => {
    setDeletingSprintId(sprintId)
  }

  const confirmDelete = async () => {
    if (!deletingSprintId) return

    try {
      const response = await fetch(`/api/sprints/${deletingSprintId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Sikertelen törlés')
      }

      toast.success('Sprint sikeresen törölve')
      setDeletingSprintId(null)
      if (onSprintUpdate) {
        onSprintUpdate()
      }
    } catch (error) {
      toast.error('Hiba történt a törlés során')
      console.error('Error deleting sprint:', error)
    }
  }

  const handleEditSuccess = () => {
    setEditingSprint(null)
    if (onSprintUpdate) {
      onSprintUpdate()
    }
  }

  const toggleSprint = (sprintId: string) => {
    const newExpanded = new Set(expandedSprints)
    if (newExpanded.has(sprintId)) {
      newExpanded.delete(sprintId)
    } else {
      newExpanded.add(sprintId)
    }
    setExpandedSprints(newExpanded)
  }

  // Sort sprints by order
  const sortedSprints = [...sprints].sort((a, b) => a.order - b.order)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-display font-bold text-gray-900">
          Sprint Terv
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {sprints.length} sprint generálva
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedSprints.map((sprint) => {
          const isExpanded = expandedSprints.has(sprint.id)
          const startDate = new Date(sprint.start_date)
          const endDate = new Date(sprint.end_date)
          const sprintSegmentsPrimary = sprint.focus_segments_primary ?? []
          const sprintSegmentsSecondary = sprint.focus_segments_secondary ?? []
          const sprintTopicsPrimary = sprint.focus_topics_primary ?? []
          const sprintTopicsSecondary = sprint.focus_topics_secondary ?? []
          const sprintChannelsPrimary = sprint.focus_channels_primary ?? []
          const sprintChannelsSecondary = sprint.focus_channels_secondary ?? []

          return (
            <div key={sprint.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4
                      className="text-base font-display font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                      onClick={() => campaignId && router.push(`/campaigns/${campaignId}/sprints/${sprint.id}`)}
                    >
                      {sprint.name}
                    </h4>
                    <Badge
                      className={`${focusGoalColors[sprint.focus_goal || 'awareness'] || 'bg-gray-100 text-gray-700 border-gray-200'} border`}
                    >
                      {focusGoalLabels[sprint.focus_goal || 'awareness'] || sprint.focus_goal || 'awareness'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(startDate, 'yyyy.MM.dd')} - {format(endDate, 'yyyy.MM.dd')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{sprintSegmentsPrimary.length + sprintSegmentsSecondary.length} szegmens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{sprintTopicsPrimary.length + sprintTopicsSecondary.length} téma</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4" />
                      <span>{sprintChannelsPrimary.length + sprintChannelsSecondary.length} csatorna</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {sprint.focus_description}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Fő szegmensek
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprintSegmentsPrimary.map(segId => (
                            <Badge key={`primary-${segId}`} variant="outline" className="text-xs">
                              {segmentNames[segId] || segId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Kiegészítő szegmensek
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprintSegmentsSecondary.map(segId => (
                            <Badge key={`secondary-${segId}`} variant="outline" className="text-xs">
                              {segmentNames[segId] || segId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Fő témák
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprintTopicsPrimary.map(topicId => (
                            <Badge key={`primary-topic-${topicId}`} variant="outline" className="text-xs">
                              {topicNames[topicId] || topicId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Kiegészítő témák
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprintTopicsSecondary.map(topicId => (
                            <Badge key={`secondary-topic-${topicId}`} variant="outline" className="text-xs">
                              {topicNames[topicId] || topicId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Fő csatornák
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprintChannelsPrimary.map(channel => (
                            <Badge key={`primary-channel-${channel}`} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Kiegészítő csatornák
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprintChannelsSecondary.map(channel => (
                            <Badge key={`secondary-channel-${channel}`} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">

                  {campaignId && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(sprint.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Szerkesztés
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(sprint.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Törlés
                      </Button>
                    </>
                  )}
                  <button
                    onClick={() => toggleSprint(sprint.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={isExpanded ? 'Összecsukás' : 'Kibontás'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Form Dialog */}
      {editingSprint && campaignId && (
        <SprintForm
          initialData={editingSprint}
          campaignId={campaignId}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingSprint(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingSprintId !== null} onOpenChange={() => setDeletingSprintId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Törlés megerősítése</DialogTitle>
            <DialogDescription>
              Biztosan törölni szeretnéd ezt a sprintet? A kapcsolódó tartalom slotok is törlődnek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSprintId(null)}>
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

