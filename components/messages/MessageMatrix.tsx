'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import MessageForm from './MessageForm'

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
  const [selectedCell, setSelectedCell] = useState<{
    segmentId: string
    topicId: string
  } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getMessageForCell = (segmentId: string, topicId: string) => {
    return messages.find(
      (m) => m.segment_id === segmentId && m.topic_id === topicId
    )
  }

  const handleCellClick = (segmentId: string, topicId: string) => {
    setSelectedCell({ segmentId, topicId })
    setIsDialogOpen(true)
  }

  return (
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
    </div>
  )
}
