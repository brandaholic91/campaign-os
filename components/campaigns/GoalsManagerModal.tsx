'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Target, Edit2, Plus } from 'lucide-react'
import type { Goal } from '@/lib/validation/campaign-structure'
import { GoalEditModal } from './GoalEditModal'

interface GoalsManagerModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
}

export function GoalsManagerModal({ isOpen, onClose, campaignId }: GoalsManagerModalProps) {
  const [goals, setGoals] = useState<(Goal & { id: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState<Goal & { id: string } | null>(null)

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/structure`)
      if (!response.ok) throw new Error('Failed to fetch structure')
      const data = await response.json()
      setGoals(data.goals || [])
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchGoals()
    }
  }, [isOpen, campaignId])

  const handleEdit = (goal: Goal & { id: string }) => {
    setEditingGoal(goal)
  }

  const handleSave = async () => {
    await fetchGoals()
    setEditingGoal(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              Célok kezelése
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Betöltés...</div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nincsenek célok rögzítve.</div>
            ) : (
              <div className="grid gap-4">
                {goals.map((goal, index) => (
                  <div 
                    key={goal.id || index} 
                    className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-200 transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          Prioritás: {goal.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500 pt-1">
                        {goal.funnel_stage && (
                          <div>
                            Funnel: <span className="font-medium capitalize">{goal.funnel_stage}</span>
                          </div>
                        )}
                        {goal.kpi_hint && (
                          <div>
                            KPI: <span className="font-medium">{goal.kpi_hint}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500 hover:text-amber-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editingGoal && (
        <GoalEditModal
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          goal={editingGoal}
          campaignId={campaignId}
          onSave={handleSave}
        />
      )}
    </>
  )
}
