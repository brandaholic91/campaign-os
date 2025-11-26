'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ContentDraft } from '@/lib/ai/schemas'
import { Edit, Check, X, Trash2, Sparkles, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface DraftPreviewModalProps {
  draft: ContentDraft | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (draft: ContentDraft) => void
  onApprove: (draft: ContentDraft) => void
  onReject: (draft: ContentDraft) => void
  onDelete: (draft: ContentDraft) => void
  onGenerateNew: () => void
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

export function DraftPreviewModal({
  draft,
  open,
  onOpenChange,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  onGenerateNew
}: DraftPreviewModalProps) {
  if (!draft) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Másolva vágólapra')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="flex items-center gap-2">
              {draft.variant_name || 'Vázlat'}
              <Badge className={`${statusColors[draft.status] || 'bg-gray-100'} border text-xs font-normal`}>
                {statusLabels[draft.status] || draft.status}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hook</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(draft.hook)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-gray-900 font-medium">{draft.hook}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Törzsszöveg</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(draft.body)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{draft.body}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CTA</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(draft.cta_copy)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-gray-900 font-medium">{draft.cta_copy}</p>
              </div>
            </div>
          </div>

          {/* Visual & Production Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 border-b pb-1">Vizuális Tartalom</h4>
              
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500">Vizuális Ötlet</span>
                <p className="text-sm text-gray-700">{draft.visual_idea}</p>
              </div>

              {draft.alt_text_suggestion && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Alt Text Javaslat</span>
                  <p className="text-sm text-gray-700">{draft.alt_text_suggestion}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 border-b pb-1">Egyéb Jegyzetek</h4>
              
              {draft.length_hint && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Hossz Javaslat</span>
                  <p className="text-sm text-gray-700">{draft.length_hint}</p>
                </div>
              )}

              {draft.tone_notes && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Hangnem Jegyzetek</span>
                  <p className="text-sm text-gray-700">{draft.tone_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex items-center gap-2 mr-auto">
            <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); onGenerateNew(); }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Új Variáns
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-red-50" onClick={() => { onDelete(draft); onOpenChange(false); }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Törlés
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { onEdit(draft); onOpenChange(false); }}>
              <Edit className="w-4 h-4 mr-2" />
              Szerkesztés
            </Button>
            
            {draft.status === 'draft' && (
              <>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => { onReject(draft); onOpenChange(false); }}>
                  <X className="w-4 h-4 mr-2" />
                  Elutasítás
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { onApprove(draft); onOpenChange(false); }}>
                  <Check className="w-4 h-4 mr-2" />
                  Jóváhagyás
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
