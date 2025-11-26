'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageSquare, Edit2 } from 'lucide-react'
import type { Narrative } from '@/lib/validation/campaign-structure'
import { NarrativeEditModal } from './NarrativeEditModal'

interface NarrativesManagerModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
}

export function NarrativesManagerModal({ isOpen, onClose, campaignId }: NarrativesManagerModalProps) {
  const [narratives, setNarratives] = useState<(Narrative & { id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingNarrative, setEditingNarrative] = useState<Narrative & { id: string } | null>(null)

  const fetchNarratives = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/structure`)
      if (!response.ok) throw new Error('Failed to fetch structure')
      const data = await response.json()
      setNarratives(data.narratives || [])
    } catch (error) {
      console.error('Failed to fetch narratives:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNarratives()
    }
  }, [isOpen, campaignId])

  const handleEdit = (narrative: Narrative & { id: string }) => {
    setEditingNarrative(narrative)
  }

  const handleSave = async () => {
    await fetchNarratives()
    setEditingNarrative(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              Narratívák kezelése
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Betöltés...</div>
            ) : narratives.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nincsenek narratívák rögzítve.</div>
            ) : (
              <div className="grid gap-4">
                {narratives.map((narrative, index) => (
                  <div 
                    key={narrative.id || index} 
                    className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{narrative.title}</h4>
                        {narrative.priority && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                            Prioritás: {narrative.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{narrative.description}</p>
                      {narrative.suggested_phase && (
                        <div className="text-xs text-gray-500 pt-1">
                          Javasolt fázis: <span className="font-medium capitalize">{narrative.suggested_phase}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(narrative)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500 hover:text-emerald-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editingNarrative && (
        <NarrativeEditModal
          isOpen={!!editingNarrative}
          onClose={() => setEditingNarrative(null)}
          narrative={editingNarrative}
          campaignId={campaignId}
          onSave={handleSave}
        />
      )}
    </>
  )
}
