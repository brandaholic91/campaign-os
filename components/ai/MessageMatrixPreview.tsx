'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit2, Save, X, RefreshCw } from 'lucide-react'
import { GeneratedMessage } from '@/lib/ai/schemas'
import { toast } from 'sonner'

interface MessageMatrixPreviewProps {
  messages: GeneratedMessage[]
  segments: Array<{ id: string; name: string }>
  topics: Array<{ id: string; name: string }>
  campaignId: string
  onSave: (messages: GeneratedMessage[]) => void
  onCancel: () => void
  onRegenerate?: (regeneratedMessages: GeneratedMessage[]) => void
  isSaving: boolean
}

interface EditableMessage extends GeneratedMessage {
  selected: boolean
  isEditing: boolean
}

export function MessageMatrixPreview({
  messages: initialMessages,
  segments,
  topics,
  campaignId,
  onSave,
  onCancel,
  onRegenerate,
  isSaving,
}: MessageMatrixPreviewProps) {
  const [messages, setMessages] = useState<EditableMessage[]>(
    initialMessages.map(msg => ({ ...msg, selected: true, isEditing: false }))
  )
  const [editingMessage, setEditingMessage] = useState<EditableMessage | null>(null)
  const [editValues, setEditValues] = useState<Partial<GeneratedMessage> | null>(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false)

  const getSegmentName = (segmentId: string) => 
    segments.find(s => s.id === segmentId)?.name || segmentId

  const getTopicName = (topicId: string) => 
    topics.find(t => t.id === topicId)?.name || topicId

  const toggleSelection = (index: number) => {
    const newMessages = [...messages]
    newMessages[index].selected = !newMessages[index].selected
    setMessages(newMessages)
  }

  const startEditing = (index: number) => {
    const message = messages[index]
    setEditingMessage(message)
    setEditValues({
      headline: message.headline,
      body: message.body,
      proof_point: message.proof_point,
      cta: message.cta,
      message_type: message.message_type,
    })
    const newMessages = [...messages]
    newMessages[index].isEditing = true
    setMessages(newMessages)
  }

  const saveEdit = (index: number) => {
    if (!editValues) return

    const newMessages = [...messages]
    newMessages[index] = {
      ...newMessages[index],
      ...editValues,
      isEditing: false,
    }
    setMessages(newMessages)
    setEditingMessage(null)
    setEditValues(null)
  }

  const cancelEdit = (index: number) => {
    const newMessages = [...messages]
    newMessages[index].isEditing = false
    setMessages(newMessages)
    setEditingMessage(null)
    setEditValues(null)
  }

  const handleSave = () => {
    const selectedMessages = messages
      .filter(msg => msg.selected)
      .map(({ selected, isEditing, ...msg }) => msg)
    onSave(selectedMessages)
  }

  const handleRegenerate = async (index?: number) => {
    if (index !== undefined) {
      // Regenerate single message
      const message = messages[index]
      setRegeneratingIndex(index)
      
      try {
        const response = await fetch('/api/ai/message-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: campaignId,
            segment_ids: [message.segment_id],
            topic_ids: [message.topic_id],
            regenerate_combinations: [`${message.segment_id}:${message.topic_id}`],
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to regenerate message')
        }

        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          const newMessage = data.messages[0]
          const newMessages = [...messages]
          newMessages[index] = { ...newMessage, selected: messages[index].selected, isEditing: false } as EditableMessage
          setMessages(newMessages)
          toast.success('Üzenet újragenerálva')
          
          if (onRegenerate) {
            onRegenerate([newMessage])
          }
        }
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Hiba történt az újragenerálás során')
      } finally {
        setRegeneratingIndex(null)
      }
    } else {
      // Regenerate all selected messages
      const selectedMessages = messages.filter(msg => msg.selected)
      if (selectedMessages.length === 0) {
        toast.error('Válassz ki legalább egy üzenetet az újrageneráláshoz')
        return
      }

      setIsRegeneratingAll(true)
      const combinations = selectedMessages.map(msg => `${msg.segment_id}:${msg.topic_id}`)
      const segmentIds = Array.from(new Set(selectedMessages.map(msg => msg.segment_id)))
      const topicIds = Array.from(new Set(selectedMessages.map(msg => msg.topic_id)))

      try {
        const response = await fetch('/api/ai/message-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: campaignId,
            segment_ids: segmentIds,
            topic_ids: topicIds,
            regenerate_combinations: combinations,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to regenerate messages')
        }

        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          // Replace messages by segment_id:topic_id key
          const newMessagesMap = new Map(
            data.messages.map((msg: GeneratedMessage) => [`${msg.segment_id}:${msg.topic_id}`, msg])
          )
          
          const updatedMessages: EditableMessage[] = messages.map(msg => {
            const key = `${msg.segment_id}:${msg.topic_id}`
            const newMsg = newMessagesMap.get(key)
            if (newMsg) {
              return { ...newMsg, selected: msg.selected, isEditing: false } as EditableMessage
            }
            return msg
          })
          
          setMessages(updatedMessages)
          toast.success(`${data.messages.length} üzenet újragenerálva`)
          
          if (onRegenerate) {
            onRegenerate(data.messages)
          }
        }
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Hiba történt az újragenerálás során')
      } finally {
        setIsRegeneratingAll(false)
      }
    }
  }

  const selectedCount = messages.filter(m => m.selected).length
  const totalCount = messages.length

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Generált Üzenetek Előnézet</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {totalCount} üzenet generálva • {selectedCount} kiválasztva mentésre
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCount === totalCount && totalCount > 0}
                    onCheckedChange={(checked) => {
                      setMessages(messages.map(msg => ({ ...msg, selected: !!checked })))
                    }}
                  />
                </TableHead>
                <TableHead>Célcsoport</TableHead>
                <TableHead>Téma</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Proof Point</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Típus</TableHead>
                <TableHead className="w-32">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message, index) => (
                <TableRow key={`${message.segment_id}-${message.topic_id}`}>
                  <TableCell>
                    <Checkbox
                      checked={message.selected}
                      onCheckedChange={() => toggleSelection(index)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getSegmentName(message.segment_id)}
                  </TableCell>
                  <TableCell>{getTopicName(message.topic_id)}</TableCell>
                  <TableCell>
                    {message.isEditing && editingMessage === message ? (
                      <Input
                        value={editValues?.headline || ''}
                        onChange={(e) => setEditValues({ ...editValues, headline: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <div className="text-sm line-clamp-2">{message.headline}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {message.isEditing && editingMessage === message ? (
                      <Textarea
                        value={editValues?.body || ''}
                        onChange={(e) => setEditValues({ ...editValues, body: e.target.value })}
                        className="min-h-[60px] text-sm"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {message.body}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {message.isEditing && editingMessage === message ? (
                      <Input
                        value={editValues?.proof_point || ''}
                        onChange={(e) => setEditValues({ ...editValues, proof_point: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="Optional"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {message.proof_point || '-'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {message.isEditing && editingMessage === message ? (
                      <Input
                        value={editValues?.cta || ''}
                        onChange={(e) => setEditValues({ ...editValues, cta: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="Optional"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {message.cta || '-'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {message.isEditing && editingMessage === message ? (
                      <select
                        value={editValues?.message_type || 'core'}
                        onChange={(e) => setEditValues({ ...editValues, message_type: e.target.value as any })}
                        className="h-8 text-sm border rounded px-2"
                      >
                        <option value="core">core</option>
                        <option value="supporting">supporting</option>
                        <option value="contrast">contrast</option>
                      </select>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {message.message_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {message.isEditing && editingMessage === message ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveEdit(index)}
                            className="h-7 w-7 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelEdit(index)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(index)}
                            className="h-7 w-7 p-0"
                            title="Szerkesztés"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRegenerate(index)}
                            disabled={regeneratingIndex === index || isRegeneratingAll}
                            className="h-7 w-7 p-0"
                            title="Újragenerálás"
                          >
                            {regeneratingIndex === index ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleRegenerate()} 
              disabled={isSaving || isRegeneratingAll || selectedCount === 0}
            >
              {isRegeneratingAll ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Újragenerálás...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Kiválasztottak Újragenerálása ({selectedCount})
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving || isRegeneratingAll}>
              Mégse
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isRegeneratingAll || selectedCount === 0}>
              {isSaving ? (
                'Mentés...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kiválasztottak Mentése ({selectedCount})
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

