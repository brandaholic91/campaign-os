'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { MatrixConnectionModal } from './MatrixConnectionModal'

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

interface EditMatrixConnectionsModalProps {
  isOpen: boolean
  onClose: () => void
  segments: Segment[]
  topics: Topic[]
  matrixEntries: MatrixEntry[]
  campaignId: string
  onSuccess?: () => void
}

export function EditMatrixConnectionsModal({
  isOpen,
  onClose,
  segments,
  topics,
  matrixEntries,
  campaignId,
  onSuccess,
}: EditMatrixConnectionsModalProps) {
  const [selectedEntry, setSelectedEntry] = useState<MatrixEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEntry(null)
      setIsEditModalOpen(false)
    }
  }, [isOpen])

  const handleEdit = (entry: MatrixEntry) => {
    setSelectedEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setSelectedEntry(null)
    if (onSuccess) {
      onSuccess()
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Matrix Kapcsolatok Szerkesztése</DialogTitle>
            <DialogDescription>
              Válassz ki egy kapcsolatot a szerkesztéshez.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {matrixEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nincsenek mátrix kapcsolatok a szerkesztéshez.
              </div>
            ) : (
              <div className="space-y-2">
                {matrixEntries.map((entry) => {
                  const key = `${entry.segment_id}:${entry.topic_id}`
                  
                  return (
                    <div
                      key={key}
                      className="
                        flex items-start gap-3 p-3 rounded-lg border transition-colors
                        bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50
                        cursor-pointer
                      "
                      onClick={() => handleEdit(entry)}
                    >
                      <div className="mt-1 p-1.5 rounded bg-primary-100 text-primary-600">
                        <Pencil className="w-4 h-4" />
                      </div>
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
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {getImportanceLabel(entry.importance)}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {getRoleLabel(entry.role)}
                          </span>
                        </div>
                        {entry.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2">
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

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Bezárás
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedEntry && (
        <MatrixConnectionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedEntry(null)
          }}
          segments={segments}
          topics={topics}
          campaignId={campaignId}
          initialData={{
            segmentId: selectedEntry.segment_id,
            topicId: selectedEntry.topic_id,
            importance: (selectedEntry.importance as 'high' | 'medium' | 'low') || 'medium',
            role: (selectedEntry.role as 'core_message' | 'support' | 'experimental') || 'support',
            summary: selectedEntry.summary || '',
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}

