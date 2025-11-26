'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ContentSlot, ContentDraft } from '@/lib/ai/schemas'
import { SlotDetailView } from './SlotDetailView'
import { DraftList } from './DraftList'
import { DraftGenerationModal } from './DraftGenerationModal'
import { DraftPreviewModal } from './DraftPreviewModal'
import { DraftEditModal } from './DraftEditModal'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'

interface SlotDetailPageProps {
  campaignId: string
  sprintId: string
  slotId: string
}

export function SlotDetailPage({ campaignId, sprintId, slotId }: SlotDetailPageProps) {
  const router = useRouter()
  const [slot, setSlot] = useState<ContentSlot | null>(null)
  const [drafts, setDrafts] = useState<ContentDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [segmentNames, setSegmentNames] = useState<Record<string, string>>({})
  const [topicNames, setTopicNames] = useState<Record<string, string>>({})
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
  }, [slotId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const db = supabase.schema('campaign_os')

      // 1. Load slot data
      const { data: slotData, error: slotError } = await db
        .from('content_slots')
        .select('*')
        .eq('id', slotId)
        .single()

      if (slotError || !slotData) {
        console.error('Error loading slot:', slotError)
        toast.error('Slot betöltése sikertelen')
        return
      }

      // Map slot data
      const contentSlot: ContentSlot = {
        id: slotData.id,
        sprint_id: slotData.sprint_id,
        campaign_id: slotData.campaign_id,
        date: slotData.date,
        channel: slotData.channel,
        slot_index: slotData.slot_index,
        primary_segment_id: slotData.primary_segment_id || undefined,
        primary_topic_id: slotData.primary_topic_id || undefined,
        secondary_segment_ids: (slotData.secondary_segment_ids as any as string[]) || undefined,
        secondary_topic_ids: (slotData.secondary_topic_ids as any as string[]) || undefined,
        related_goal_ids: (slotData.related_goal_ids as any as string[]) || [],
        objective: slotData.objective as any,
        content_type: slotData.content_type as any,
        funnel_stage: slotData.funnel_stage as any,
        angle_type: slotData.angle_type as any,
        cta_type: slotData.cta_type as any,
        time_of_day: slotData.time_of_day as any,
        angle_hint: slotData.angle_hint || undefined,
        notes: slotData.notes || undefined,
        status: (slotData.status as any) || 'planned',
        tone_override: slotData.tone_override || undefined,
        asset_requirements: (slotData.asset_requirements as any as string[]) || undefined,
        owner: slotData.owner || undefined,
        draft_status: 'no_draft', // Will be updated after loading drafts
      }

      setSlot(contentSlot)

      // 2. Load drafts
      const { data: draftsData, error: draftsError } = await db
        .from('content_drafts')
        .select('*')
        .eq('slot_id', slotId)

      if (draftsError) {
        console.error('Error loading drafts:', draftsError)
        toast.error('Draftok betöltése sikertelen')
        // Don't return, we still have the slot
      } else {
        const loadedDrafts = (draftsData || []) as ContentDraft[]
        setDrafts(loadedDrafts)
        
        // Update draft status based on loaded drafts
        if (loadedDrafts.length > 0) {
          let status: 'no_draft' | 'has_draft' | 'approved' | 'published' = 'has_draft'
          if (loadedDrafts.some(d => d.status === 'published')) status = 'published'
          else if (loadedDrafts.some(d => d.status === 'approved')) status = 'approved'
          
          setSlot(prev => prev ? { ...prev, draft_status: status } : null)
        }
      }

      // Load names (segments and topics)
      const segmentIds = new Set<string>()
      const topicIds = new Set<string>()
      
      if (contentSlot.primary_segment_id) segmentIds.add(contentSlot.primary_segment_id)
      if (contentSlot.secondary_segment_ids) contentSlot.secondary_segment_ids.forEach(id => segmentIds.add(id))
      
      if (contentSlot.primary_topic_id) topicIds.add(contentSlot.primary_topic_id)
      if (contentSlot.secondary_topic_ids) contentSlot.secondary_topic_ids.forEach(id => topicIds.add(id))

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

    } catch (error) {
      console.error('Error loading slot data:', error)
      toast.error('Hiba történt az adatok betöltése során')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSlot = () => {
    router.push(`/campaigns/${campaignId}/sprints/${sprintId}/slots/${slotId}/edit`)
  }

  const handleDeleteSlot = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a slotot?')) return

    try {
      const response = await fetch(`/api/content-slots/${slotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Törlés sikertelen')

      toast.success('Slot törölve')
      router.push(`/campaigns/${campaignId}/sprints/${sprintId}`)
    } catch (error) {
      toast.error('Hiba történt a törlés során')
    }
  }

  const handleGenerateDraft = () => {
    setIsGenerationModalOpen(true)
  }

  const handleGenerationSuccess = (newDrafts: ContentDraft[]) => {
    // Reload data to ensure everything is in sync
    loadData()
  }

  const handlePreviewDraft = (draft: ContentDraft) => {
    setSelectedDraft(draft)
    setIsPreviewOpen(true)
  }

  const handleEditDraft = (draft: ContentDraft) => {
    setSelectedDraft(draft)
    setIsEditOpen(true)
  }

  const handleApproveDraft = async (draft: ContentDraft) => {
    try {
      const response = await fetch(`/api/content-drafts/${draft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (!response.ok) throw new Error('Jóváhagyás sikertelen')

      toast.success('Draft jóváhagyva')
      loadData()
    } catch (error) {
      toast.error('Hiba történt a jóváhagyás során')
    }
  }

  const handleRejectDraft = async (draft: ContentDraft) => {
    try {
      const response = await fetch(`/api/content-drafts/${draft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) throw new Error('Elutasítás sikertelen')

      toast.success('Draft elutasítva')
      loadData()
    } catch (error) {
      toast.error('Hiba történt az elutasítás során')
    }
  }

  const handleDeleteDraft = async (draft: ContentDraft) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a draftot?')) return

    try {
      const response = await fetch(`/api/content-drafts/${draft.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Törlés sikertelen')

      toast.success('Draft törölve')
      loadData()
    } catch (error) {
      toast.error('Hiba történt a törlés során')
    }
  }

  const handleSaveDraft = async (draftId: string, values: any) => {
    try {
      const response = await fetch(`/api/content-drafts/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Mentés sikertelen')

      toast.success('Draft mentve')
      loadData()
    } catch (error) {
      toast.error('Hiba történt a mentés során')
      throw error // Re-throw to let modal know it failed
    }
  }

  const handleGenerateNewVariant = () => {
    // Open generation modal with current settings if possible, or just open it
    // For now, just open the generation modal
    setIsGenerationModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!slot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Slot nem található</p>
        <Button onClick={() => router.push(`/campaigns/${campaignId}/sprints/${sprintId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza a sprinthoz
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/campaigns/${campaignId}/sprints/${sprintId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza a sprinthoz
          </Button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Tartalom Slot Részletek
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Metadata */}
          <div className="lg:col-span-1">
            <SlotDetailView
              slot={slot}
              segmentNames={segmentNames}
              topicNames={topicNames}
              onEdit={handleEditSlot}
              onDelete={handleDeleteSlot}
            />
          </div>

          {/* Right Column: Drafts */}
          <div className="lg:col-span-2">
            <DraftList
              drafts={drafts}
              onPreview={handlePreviewDraft}
              onEdit={handleEditDraft}
              onApprove={handleApproveDraft}
              onReject={handleRejectDraft}
              onDelete={handleDeleteDraft}
              onGenerate={handleGenerateDraft}
            />
          </div>
        </div>

        <DraftGenerationModal
          open={isGenerationModalOpen}
          onOpenChange={setIsGenerationModalOpen}
          slotId={slotId}
          onSuccess={handleGenerationSuccess}
        />

        <DraftPreviewModal
          draft={selectedDraft}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          onEdit={handleEditDraft}
          onApprove={handleApproveDraft}
          onReject={handleRejectDraft}
          onDelete={handleDeleteDraft}
          onGenerateNew={handleGenerateNewVariant}
        />

        <DraftEditModal
          draft={selectedDraft}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSave={handleSaveDraft}
        />
      </div>
    </div>
  )
}
