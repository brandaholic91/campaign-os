'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types matching the schema
type Segment = {
  id?: string
  name: string
  short_label?: string
  [key: string]: any
}

type Topic = {
  id?: string
  name: string
  short_label?: string
  [key: string]: any
}

type MatrixEntry = {
  segment_index: number
  topic_index: number
  importance: 'high' | 'medium' | 'low'
  role: 'core_message' | 'support' | 'experimental'
  summary?: string
}

interface SegmentTopicMatrixEditorProps {
  segments: Segment[]
  topics: Topic[]
  matrix: MatrixEntry[]
  onMatrixChange: (matrix: MatrixEntry[]) => void
}

export function SegmentTopicMatrixEditor({
  segments,
  topics,
  matrix,
  onMatrixChange,
}: SegmentTopicMatrixEditorProps) {
  const [editingCell, setEditingCell] = useState<{
    segmentIndex: number
    topicIndex: number
  } | null>(null)
  const [editValues, setEditValues] = useState<{
    importance: 'high' | 'medium' | 'low'
    role: 'core_message' | 'support' | 'experimental'
    summary: string
  } | null>(null)

  const getMatrixEntry = (segmentIndex: number, topicIndex: number): MatrixEntry | null => {
    return (
      matrix.find(
        (entry) => entry.segment_index === segmentIndex && entry.topic_index === topicIndex
      ) || null
    )
  }

  const hasConnection = (segmentIndex: number, topicIndex: number): boolean => {
    return getMatrixEntry(segmentIndex, topicIndex) !== null
  }

  const handleCellClick = (segmentIndex: number, topicIndex: number) => {
    const existing = getMatrixEntry(segmentIndex, topicIndex)
    if (existing) {
      setEditingCell({ segmentIndex, topicIndex })
      setEditValues({
        importance: existing.importance,
        role: existing.role,
        summary: existing.summary || '',
      })
    } else {
      // Create new entry
      setEditingCell({ segmentIndex, topicIndex })
      setEditValues({
        importance: 'medium',
        role: 'support',
        summary: '',
      })
    }
  }

  const handleSaveEdit = () => {
    if (!editingCell || !editValues) return

    const existing = getMatrixEntry(editingCell.segmentIndex, editingCell.topicIndex)
    const newMatrix = [...matrix]

    if (existing) {
      // Update existing
      const index = newMatrix.findIndex(
        (e) =>
          e.segment_index === editingCell.segmentIndex &&
          e.topic_index === editingCell.topicIndex
      )
      if (index >= 0) {
        newMatrix[index] = {
          ...existing,
          importance: editValues.importance,
          role: editValues.role,
          summary: editValues.summary || undefined,
        }
      }
    } else {
      // Add new
      newMatrix.push({
        segment_index: editingCell.segmentIndex,
        topic_index: editingCell.topicIndex,
        importance: editValues.importance,
        role: editValues.role,
        summary: editValues.summary || undefined,
      })
    }

    onMatrixChange(newMatrix)
    setEditingCell(null)
    setEditValues(null)
  }

  const handleDelete = (segmentIndex: number, topicIndex: number) => {
    const newMatrix = matrix.filter(
      (entry) =>
        !(entry.segment_index === segmentIndex && entry.topic_index === topicIndex)
    )
    onMatrixChange(newMatrix)
    setEditingCell(null)
    setEditValues(null)
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValues(null)
  }

  const getImportanceColor = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border-rose-200'
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'low':
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getRoleColor = (role: 'core_message' | 'support' | 'experimental') => {
    switch (role) {
      case 'core_message':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'support':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'experimental':
        return 'bg-purple-50 text-purple-600 border-purple-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Segment-Topic Matrix</h3>
          <p className="text-sm text-gray-500 mt-1">
            Kattints egy cellára a kapcsolat szerkesztéséhez vagy hozzáadásához
          </p>
        </div>
        <Badge variant="secondary">
          {matrix.length} kapcsolat
        </Badge>
      </div>

      {/* Matrix Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 border-r border-b border-gray-200 p-2 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                  Segment / Topic
                </th>
                {topics.map((topic, topicIndex) => (
                  <th
                    key={topicIndex}
                    className="border-b border-r border-gray-200 p-2 text-center text-xs font-semibold text-gray-700 min-w-[120px] max-w-[120px]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="truncate" title={topic.name}>
                        {topic.short_label || topic.name}
                      </span>
                      {topic.priority === 'primary' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          Elsődleges
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segments.map((segment, segmentIndex) => (
                <tr key={segmentIndex}>
                  <td className="sticky left-0 z-10 bg-gray-50 border-r border-b border-gray-200 p-2 text-xs font-medium text-gray-900">
                    <div className="flex flex-col gap-1">
                      <span className="truncate" title={segment.name}>
                        {segment.short_label || segment.name}
                      </span>
                      {segment.priority === 'primary' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          Elsődleges
                        </Badge>
                      )}
                    </div>
                  </td>
                  {topics.map((topic, topicIndex) => {
                    const entry = getMatrixEntry(segmentIndex, topicIndex)
                    const isConnected = hasConnection(segmentIndex, topicIndex)

                    return (
                      <td
                        key={topicIndex}
                        className={cn(
                          'border-r border-b border-gray-200 p-2 text-center cursor-pointer transition-colors hover:bg-gray-50',
                          isConnected && 'bg-primary-50/30'
                        )}
                        onClick={() => handleCellClick(segmentIndex, topicIndex)}
                      >
                        {entry ? (
                          <div className="flex flex-col gap-1 items-center">
                            <div className="flex gap-1 flex-wrap justify-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 border',
                                  getImportanceColor(entry.importance)
                                )}
                              >
                                {entry.importance === 'high'
                                  ? 'Magas'
                                  : entry.importance === 'medium'
                                    ? 'Közepes'
                                    : 'Alacsony'}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 border',
                                  getRoleColor(entry.role)
                                )}
                              >
                                {entry.role === 'core_message'
                                  ? 'Fő'
                                  : entry.role === 'support'
                                    ? 'Támogató'
                                    : 'Kísérleti'}
                              </Badge>
                            </div>
                            {entry.summary && (
                              <p className="text-[10px] text-gray-600 line-clamp-2 mt-1">
                                {entry.summary}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs">+</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingCell !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCell && getMatrixEntry(editingCell.segmentIndex, editingCell.topicIndex)
                ? 'Matrix Kapcsolat Szerkesztése'
                : 'Új Matrix Kapcsolat'}
            </DialogTitle>
            <DialogDescription>
              {editingCell && (
                <>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-semibold">Segment:</span>{' '}
                      {segments[editingCell.segmentIndex]?.name}
                    </p>
                    <p>
                      <span className="font-semibold">Topic:</span>{' '}
                      {topics[editingCell.topicIndex]?.name}
                    </p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {editValues && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="importance">Fontosság</Label>
                  <Select
                    value={editValues.importance}
                    onValueChange={(value: 'high' | 'medium' | 'low') =>
                      setEditValues({ ...editValues, importance: value })
                    }
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="role">Szerep</Label>
                  <Select
                    value={editValues.role}
                    onValueChange={(value: 'core_message' | 'support' | 'experimental') =>
                      setEditValues({ ...editValues, role: value })
                    }
                  >
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">
                  Összefoglaló (2-3 mondat, max 500 karakter)
                </Label>
                <Textarea
                  id="summary"
                  value={editValues.summary}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 500) {
                      setEditValues({ ...editValues, summary: value })
                    }
                  }}
                  rows={4}
                  placeholder="Rövid összefoglaló a segment-topic kapcsolatról..."
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {editValues.summary.length}/500 karakter
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {editingCell &&
              getMatrixEntry(editingCell.segmentIndex, editingCell.topicIndex) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (editingCell) {
                      handleDelete(editingCell.segmentIndex, editingCell.topicIndex)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Törlés
                </Button>
              )}
            <Button variant="outline" onClick={handleCancelEdit}>
              Mégse
            </Button>
            <Button onClick={handleSaveEdit}>Mentés</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

