'use client'

import React, { useState } from 'react'
import { SprintPlan } from '@/lib/ai/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Calendar, Target, Users, MessageSquare, Radio, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SprintEditForm } from './SprintEditForm'
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

type Sprint = Database['campaign_os']['Tables']['sprints']['Row']

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
        sprint.focus_segments.forEach(id => segmentIds.add(id))
        sprint.focus_topics.forEach(id => topicIds.add(id))
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

    setEditingSprint(sprint)
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

          return (
            <div key={sprint.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-base font-display font-semibold text-gray-900">
                      {sprint.name}
                    </h4>
                    <Badge
                      className={`${focusGoalColors[sprint.focus_goal] || 'bg-gray-100 text-gray-700 border-gray-200'} border`}
                    >
                      {focusGoalLabels[sprint.focus_goal] || sprint.focus_goal}
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
                      <span>{sprint.focus_segments.length} szegmens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{sprint.focus_topics.length} téma</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4" />
                      <span>{sprint.focus_channels.length} csatorna</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {sprint.focus_description}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Fókusz szegmensek
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprint.focus_segments.map(segId => (
                            <Badge key={segId} variant="outline" className="text-xs">
                              {segmentNames[segId] || segId}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Fókusz témák
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprint.focus_topics.map(topicId => (
                            <Badge key={topicId} variant="outline" className="text-xs">
                              {topicNames[topicId] || topicId}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Csatornák
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sprint.focus_channels.map(channel => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center gap-2">
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
        <SprintEditForm
          sprint={editingSprint}
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

