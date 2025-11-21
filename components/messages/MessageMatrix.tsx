'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Sparkles, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import MessageForm from './MessageForm'
import { MessageMatrixPreview } from '@/components/ai/MessageMatrixPreview'
import { GeneratedMessage } from '@/lib/ai/schemas'
import { toast } from 'sonner'

type Message = Database['campaign_os']['Tables']['messages']['Row']
type Segment = Database['campaign_os']['Tables']['segments']['Row']
type Topic = Database['campaign_os']['Tables']['topics']['Row']

interface MessageMatrixProps {
  campaignId: string
  segments: Segment[]
  topics: Topic[]
  messages: Message[]
}

export default function MessageMatrix({
  campaignId,
  segments,
  topics,
  messages,
}: MessageMatrixProps) {
  const router = useRouter()
  const [selectedCell, setSelectedCell] = useState<{
    segmentId: string
    topicId: string
  } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // AI generation state
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const getMessageForCell = (segmentId: string, topicId: string) => {
    return messages.find(
      (m) => m.segment_id === segmentId && m.topic_id === topicId
    )
  }

  const handleCellClick = (segmentId: string, topicId: string) => {
    setSelectedCell({ segmentId, topicId })
    setIsDialogOpen(true)
  }

  const toggleSegment = (segmentId: string) => {
    const newSet = new Set(selectedSegments)
    if (newSet.has(segmentId)) {
      newSet.delete(segmentId)
    } else {
      newSet.add(segmentId)
    }
    setSelectedSegments(newSet)
  }

  const toggleTopic = (topicId: string) => {
    const newSet = new Set(selectedTopics)
    if (newSet.has(topicId)) {
      newSet.delete(topicId)
    } else {
      newSet.add(topicId)
    }
    setSelectedTopics(newSet)
  }

  const handleGenerateMessages = async () => {
    if (selectedSegments.size === 0 || selectedTopics.size === 0) {
      toast.error('Válassz ki legalább egy célcsoportot és egy témát')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/message-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          segment_ids: Array.from(selectedSegments),
          topic_ids: Array.from(selectedTopics),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate messages')
      }

      const data = await response.json()
      setGeneratedMessages(data.messages)
      setIsPreviewOpen(true)
      toast.success(`${data.messages.length} üzenet generálva`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás során')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveMessages = async (messagesToSave: GeneratedMessage[]) => {
    setIsSaving(true)
    try {
      // Save messages one by one using existing API
      const savePromises = messagesToSave.map(message =>
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: message.campaign_id,
            segment_id: message.segment_id,
            topic_id: message.topic_id,
            headline: message.headline,
            body: message.body,
            proof_point: message.proof_point,
            cta: message.cta,
            message_type: message.message_type,
            status: 'draft',
          }),
        })
      )

      const results = await Promise.allSettled(savePromises)
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))
      
      if (failed.length > 0) {
        console.error('Some messages failed to save:', failed)
        toast.warning(`${failed.length} üzenet mentése sikertelen volt`)
      } else {
        toast.success(`${messagesToSave.length} üzenet sikeresen mentve`)
      }

      setIsPreviewOpen(false)
      setGeneratedMessages(null)
      setSelectedSegments(new Set())
      setSelectedTopics(new Set())
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Hiba történt a mentés során')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* AI Generation Controls */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Üzenet Generálás</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedSegments.size} célcsoport</span>
            <span>•</span>
            <span>{selectedTopics.size} téma</span>
            <span>•</span>
            <span>{selectedSegments.size * selectedTopics.size} kombináció</span>
          </div>
        </div>
        <Button 
          onClick={handleGenerateMessages}
          disabled={isGenerating || selectedSegments.size === 0 || selectedTopics.size === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generálás...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Üzenetek Generálása
            </>
          )}
        </Button>
      </div>

      {/* Selection UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
        <div>
          <h3 className="font-medium mb-2">Célcsoportok</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {segments.map(segment => (
              <div key={segment.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSegments.has(segment.id)}
                  onCheckedChange={() => toggleSegment(segment.id)}
                />
                <label className="text-sm cursor-pointer">
                  {segment.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Témák</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {topics.map(topic => (
              <div key={topic.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTopics.has(topic.id)}
                  onCheckedChange={() => toggleTopic(topic.id)}
                />
                <label className="text-sm cursor-pointer">
                  {topic.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
        <thead>
          <tr>
            <th className="border border-border p-2 bg-muted/50 min-w-[200px]">
              Segments \ Topics
            </th>
            {topics.map((topic) => (
              <th
                key={topic.id}
                className="border border-border p-2 bg-muted/50 min-w-[200px] text-left font-medium"
              >
                <div>{topic.name}</div>
                {topic.category && (
                  <div className="text-xs text-muted-foreground font-normal">
                    {topic.category}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment.id}>
              <td className="border border-border p-2 bg-muted/50 font-medium align-top">
                <div>{segment.name}</div>
                {segment.description && (
                  <div className="text-xs text-muted-foreground font-normal mt-1">
                    {segment.description}
                  </div>
                )}
              </td>
              {topics.map((topic) => {
                const message = getMessageForCell(segment.id, topic.id)
                return (
                  <td
                    key={`${segment.id}-${topic.id}`}
                    className="border border-border p-2 align-top hover:bg-muted/20 transition-colors cursor-pointer h-[120px]"
                    onClick={() => handleCellClick(segment.id, topic.id)}
                  >
                    {message ? (
                      <div className="space-y-2">
                        <div className="font-medium text-sm line-clamp-2">
                          {message.headline}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-3">
                          {message.body}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            {message.message_type}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add message</span>
                        </Button>
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {getMessageForCell(selectedCell?.segmentId || '', selectedCell?.topicId || '')
                ? 'Edit Message'
                : 'Create Message'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedCell && (
              <MessageForm
                campaignId={campaignId}
                segmentId={selectedCell.segmentId}
                topicId={selectedCell.topicId}
                initialData={getMessageForCell(
                  selectedCell.segmentId,
                  selectedCell.topicId
                )}
                onSuccess={() => setIsDialogOpen(false)}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generated Messages Preview */}
      {isPreviewOpen && generatedMessages && (
        <MessageMatrixPreview
          messages={generatedMessages}
          segments={segments}
          topics={topics}
          onSave={handleSaveMessages}
          onCancel={() => {
            setIsPreviewOpen(false)
            setGeneratedMessages(null)
          }}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
