'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Segment = {
  id: string
  name: string
}

type Topic = {
  id: string
  name: string
}

type MatrixEntry = {
  segment_id: string
  topic_id: string
  importance?: string
  role?: string
  summary?: string
}

interface DeleteMatrixConnectionsModalProps {
  isOpen: boolean
  onClose: () => void
  segments: Segment[]
  topics: Topic[]
  matrixEntries: MatrixEntry[]
  campaignId: string
  onSuccess?: () => void
}

export function DeleteMatrixConnectionsModal({
  isOpen,
  onClose,
  segments,
  topics,
  matrixEntries,
  campaignId,
  onSuccess,
}: DeleteMatrixConnectionsModalProps) {
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEntries(new Set())
    }
  }, [isOpen])

  const toggleEntry = (segmentId: string, topicId: string) => {
    const key = `${segmentId}:${topicId}`
    const newSet = new Set(selectedEntries)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setSelectedEntries(newSet)
  }

  const handleDelete = async () => {
    if (selectedEntries.size === 0) {
      toast.error('Válassz ki legalább egy kapcsolatot a törléshez')
      return
    }

    setIsDeleting(true)
    try {
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Delete each selected entry
      for (const key of selectedEntries) {
        const [segmentId, topicId] = key.split(':')
        
        try {
          const response = await fetch(
            `/api/segment-topic-matrix?segment_id=${segmentId}&topic_id=${topicId}`,
            {
              method: 'DELETE',
            }
          )

          if (response.ok) {
            successCount++
          } else {
            const error = await response.json()
            const segment = segments.find(s => s.id === segmentId)
            const topic = topics.find(t => t.id === topicId)
            errors.push(`${segment?.name || 'Ismeretlen'} × ${topic?.name || 'Ismeretlen'}: ${error.error || 'Hiba'}`)
            errorCount++
          }
        } catch (error) {
          const segment = segments.find(s => s.id === segmentId)
          const topic = topics.find(t => t.id === topicId)
          errors.push(`${segment?.name || 'Ismeretlen'} × ${topic?.name || 'Ismeretlen'}: hálózati hiba`)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} kapcsolat sikeresen törölve`)
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} kapcsolat törlése sikertelen${errors.length > 0 ? ': ' + errors.join(', ') : ''}`)
      }

      if (successCount > 0) {
        setSelectedEntries(new Set())
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Error deleting matrix connections:', error)
      toast.error('Hiba történt a törlés során')
    } finally {
      setIsDeleting(false)
    }
  }

  const getSegmentName = (segmentId: string) => {
    return segments.find(s => s.id === segmentId)?.name || 'Ismeretlen'
  }

  const getTopicName = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.name || 'Ismeretlen'
  }

  const getImportanceLabel = (importance?: string) => {
    const labels: Record<string, string> = {
      high: 'Magas',
      medium: 'Közepes',
      low: 'Alacsony',
    }
    return labels[importance || 'medium'] || 'Közepes'
  }

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      core_message: 'Fő üzenet',
      support: 'Támogató',
      experimental: 'Kísérleti',
    }
    return labels[role || 'support'] || 'Támogató'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Matrix Kapcsolatok Törlése</DialogTitle>
          <DialogDescription>
            Válassz ki egy vagy több kapcsolatot a törléshez.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {matrixEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nincsenek mátrix kapcsolatok a törléshez.
            </div>
          ) : (
            <div className="space-y-2">
              {matrixEntries.map((entry, index) => {
                const key = `${entry.segment_id}:${entry.topic_id}`
                const isSelected = selectedEntries.has(key)
                
                return (
                  <div
                    key={key}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer
                      ${isSelected 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => toggleEntry(entry.segment_id, entry.topic_id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleEntry(entry.segment_id, entry.topic_id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {getSegmentName(entry.segment_id)}
                        </span>
                        <span className="text-gray-400">×</span>
                        <span className="font-medium text-gray-900">
                          {getTopicName(entry.topic_id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {getImportanceLabel(entry.importance)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {getRoleLabel(entry.role)}
                        </span>
                      </div>
                      {entry.summary && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {entry.summary}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Mégse
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || selectedEntries.size === 0}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Törlés...
              </>
            ) : (
              `Törlés (${selectedEntries.size})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

