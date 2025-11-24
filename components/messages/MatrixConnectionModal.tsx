'use client'

import { useState, useEffect } from 'react'
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
import { X, Sparkles, Loader2 } from 'lucide-react'
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
  initialData?: {
    segmentId: string
    topicId: string
    importance: 'high' | 'medium' | 'low'
    role: 'core_message' | 'support' | 'experimental'
    summary: string
  }
}

export function MatrixConnectionModal({
  isOpen,
  onClose,
  segments,
  topics,
  campaignId,
  onSuccess,
  initialData,
}: MatrixConnectionModalProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(initialData?.segmentId || '')
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialData?.topicId || '')
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>(initialData?.importance || 'medium')
  const [role, setRole] = useState<'core_message' | 'support' | 'experimental'>(initialData?.role || 'support')
  const [summary, setSummary] = useState(initialData?.summary || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Update form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setSelectedSegmentId(initialData.segmentId)
      setSelectedTopicId(initialData.topicId)
      setImportance(initialData.importance)
      setRole(initialData.role)
      setSummary(initialData.summary)
    }
  }, [isOpen, initialData])

  // Reset form when modal closes (but not during save/generate operations)
  useEffect(() => {
    if (!isOpen && !isSaving && !isGenerating && !initialData) {
      setSelectedSegmentId('')
      setSelectedTopicId('')
      setImportance('medium')
      setRole('support')
      setSummary('')
    }
  }, [isOpen, isSaving, isGenerating, initialData])

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

  const handleGenerateSummary = async () => {
    if (!selectedSegmentId || !selectedTopicId) {
      toast.error('Válassz ki egy célcsoportot és egy témát az összefoglaló generálásához')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/matrix-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          segment_id: selectedSegmentId,
          topic_id: selectedTopicId,
          importance,
          role,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hiba történt a generálás során')
      }

      const data = await response.json()
      console.log('Generated summary response:', data)
      console.log('Response data type:', typeof data)
      console.log('Response data keys:', Object.keys(data))
      
      const generatedSummary = data?.summary || data?.content || ''
      console.log('Extracted summary:', generatedSummary)
      console.log('Summary type:', typeof generatedSummary)
      console.log('Summary length:', generatedSummary?.length)
      
      if (generatedSummary && generatedSummary.trim()) {
        const trimmedSummary = generatedSummary.trim()
        console.log('Setting summary to state:', trimmedSummary)
        setSummary(trimmedSummary)
        // Force a re-render check
        console.log('Summary state should be updated')
        toast.success('Összefoglaló sikeresen generálva!')
      } else {
        console.warn('Generated summary is empty or invalid:', generatedSummary)
        toast.warning('Az összefoglaló üres lett. Kérlek próbáld újra.')
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás során')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSaving && !isGenerating) {
      // Only close if not in the middle of an operation
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Matrix Kapcsolat Szerkesztése' : 'Új Matrix Kapcsolat'}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Módosítsd a kapcsolat fontosságát, szerepét vagy összefoglalóját.'
              : 'Állítsd be a kapcsolat fontosságát, szerepét és adj hozzá egy összefoglalót.'
            }
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
            <Select 
              value={selectedSegmentId} 
              onValueChange={setSelectedSegmentId}
              disabled={!!initialData}
            >
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
            {initialData && (
              <p className="text-xs text-gray-500">A célcsoport nem módosítható szerkesztés során.</p>
            )}
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label htmlFor="topic">Téma *</Label>
            <Select 
              value={selectedTopicId} 
              onValueChange={setSelectedTopicId}
              disabled={!!initialData}
            >
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
            {initialData && (
              <p className="text-xs text-gray-500">A téma nem módosítható szerkesztés során.</p>
            )}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="summary">
                Összefoglaló (2-3 mondat, max 500 karakter)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isGenerating || !selectedSegmentId || !selectedTopicId}
                className="h-8 text-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generálás...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generálás
                  </>
                )}
              </Button>
            </div>
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

