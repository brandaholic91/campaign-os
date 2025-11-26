'use client'

import React from 'react'
import { ContentDraft } from '@/lib/ai/schemas'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Edit, Check, X, Trash2, Sparkles } from 'lucide-react'

interface DraftListProps {
  drafts: ContentDraft[]
  onPreview: (draft: ContentDraft) => void
  onEdit: (draft: ContentDraft) => void
  onApprove: (draft: ContentDraft) => void
  onReject: (draft: ContentDraft) => void
  onDelete: (draft: ContentDraft) => void
  onGenerate: () => void
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  published: 'bg-purple-100 text-purple-700 border-purple-200',
}

const statusLabels: Record<string, string> = {
  draft: 'Vázlat',
  approved: 'Jóváhagyva',
  rejected: 'Elutasítva',
  published: 'Publikálva',
}

export function DraftList({ drafts, onPreview, onEdit, onApprove, onReject, onDelete, onGenerate }: DraftListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tartalom Vázlatok</h3>
        <Button onClick={onGenerate} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0">
          <Sparkles className="w-4 h-4 mr-2" />
          Tartalom generálása AI-jal
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Még nincsenek vázlatok ehhez a slothoz.</p>
          <Button variant="outline" onClick={onGenerate}>
            <Sparkles className="w-4 h-4 mr-2" />
            Első vázlat generálása
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft, index) => (
            <Card key={draft.id || index} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm text-gray-900">
                        {draft.variant_name || `Variáns ${index + 1}`}
                      </h4>
                      <Badge className={`${statusColors[draft.status] || 'bg-gray-100'} border text-[10px] px-1.5 py-0`}>
                        {statusLabels[draft.status] || draft.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                      <span className="font-semibold text-gray-900">Hook: </span>
                      {draft.hook}
                    </div>
                    
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {draft.body}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onPreview(draft)} title="Előnézet">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(draft)} title="Szerkesztés">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {draft.status === 'draft' && (
                      <>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onApprove(draft)} title="Jóváhagyás">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onReject(draft)} title="Elutasítás">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-destructive hover:bg-red-50" onClick={() => onDelete(draft)} title="Törlés">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
