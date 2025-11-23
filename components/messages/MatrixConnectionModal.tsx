'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'

type Segment = {
  id: string
  name: string
  description?: string | null
}

type Topic = {
  id: string
  name: string
  description?: string | null
}

interface MatrixConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  segments: Segment[]
  topics: Topic[]
  campaignId: string
  onSuccess?: () => void
}

export function MatrixConnectionModal({
  isOpen,
  onClose,
  segments,
  topics,
  campaignId,
  onSuccess,
}: MatrixConnectionModalProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>('medium')
  const [role, setRole] = useState<'core_message' | 'support' | 'experimental'>('support')
  const [summary, setSummary] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedSegmentId || !selectedTopicId) {
      toast.error('Válassz ki egy célcsoportot és egy témát')
      return
    }

    if (summary.length > 500) {
      toast.error('Az összefoglaló maximum 500 karakter lehet')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/segment-topic-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment_id: selectedSegmentId,
          topic_id: selectedTopicId,
          importance,
          role,
          summary: summary.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hiba történt a mentés során')
      }

      toast.success('Mátrix kapcsolat sikeresen létrehozva!')
      // Reset form
      setSelectedSegmentId('')
      setSelectedTopicId('')
      setImportance('medium')
      setRole('support')
      setSummary('')
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving matrix connection:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a mentés során')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedSegment = segments.find(s => s.id === selectedSegmentId)
  const selectedTopic = topics.find(t => t.id === selectedTopicId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Új Matrix Kapcsolat</DialogTitle>
          <DialogDescription>
            Állítsd be a kapcsolat fontosságát, szerepét és adj hozzá egy összefoglalót.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Segment and Topic Display */}
          {(selectedSegment || selectedTopic) && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {selectedSegment && (
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Célcsoport</Label>
                  <p className="text-sm font-medium text-gray-900">{selectedSegment.name}</p>
                </div>
              )}
              {selectedTopic && (
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Téma</Label>
                  <p className="text-sm font-medium text-gray-900">{selectedTopic.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Segment Selection */}
          <div className="space-y-2">
            <Label htmlFor="segment">Célcsoport *</Label>
            <Select value={selectedSegmentId} onValueChange={setSelectedSegmentId}>
              <SelectTrigger id="segment">
                <SelectValue placeholder="Válassz célcsoportot..." />
              </SelectTrigger>
              <SelectContent>
                {segments.map(segment => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label htmlFor="topic">Téma *</Label>
            <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
              <SelectTrigger id="topic">
                <SelectValue placeholder="Válassz témát..." />
              </SelectTrigger>
              <SelectContent>
                {topics.map(topic => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <Label htmlFor="importance">Fontosság *</Label>
            <Select value={importance} onValueChange={(value: 'high' | 'medium' | 'low') => setImportance(value)}>
              <SelectTrigger id="importance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Magas</SelectItem>
                <SelectItem value="medium">Közepes</SelectItem>
                <SelectItem value="low">Alacsony</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Szerep *</Label>
            <Select value={role} onValueChange={(value: 'core_message' | 'support' | 'experimental') => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core_message">Fő üzenet</SelectItem>
                <SelectItem value="support">Támogató</SelectItem>
                <SelectItem value="experimental">Kísérleti</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">
              Összefoglaló (2-3 mondat, max 500 karakter)
            </Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Rövid összefoglaló a segment-topic kapcsolatról..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {summary.length}/500 karakter
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Mégse
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedSegmentId || !selectedTopicId}>
            {isSaving ? 'Mentés...' : 'Mentés'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

