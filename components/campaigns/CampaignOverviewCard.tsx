'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Users, Hash, MessageSquare } from 'lucide-react'
import type { CampaignStructure } from '@/lib/validation/campaign-structure'

interface CampaignOverviewCardProps {
  campaignId: string
}

type ViewType = 'segments' | 'topics' | 'narratives'

export function CampaignOverviewCard({ campaignId }: CampaignOverviewCardProps) {
  const [structure, setStructure] = useState<CampaignStructure | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('segments')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/structure`)
        if (!response.ok) throw new Error('Failed to fetch structure')
        const data = await response.json()
        setStructure(data)
      } catch (error) {
        console.error('Failed to fetch campaign structure:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStructure()
  }, [campaignId])

  const getCurrentItems = () => {
    if (!structure) return []
    
    switch (currentView) {
      case 'segments':
        return structure.segments || []
      case 'topics':
        return structure.topics || []
      case 'narratives':
        return structure.narratives || []
      default:
        return []
    }
  }

  const items = getCurrentItems()
  const currentItem = items[currentIndex]
  const hasItems = items.length > 0
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < items.length - 1

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setCurrentIndex(0)
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-gray-500">Betöltés...</div>
        </div>
      </div>
    )
  }

  const viewLabels = {
    segments: 'Célcsoportok',
    topics: 'Témák',
    narratives: 'Narratívák'
  }

  const viewIcons = {
    segments: Users,
    topics: Hash,
    narratives: MessageSquare
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-gray-900">Áttekintés</h3>
        <div className="flex items-center gap-1">
          {(['segments', 'topics', 'narratives'] as ViewType[]).map((view) => {
            const Icon = viewIcons[view]
            const isActive = currentView === view
            const count = view === 'segments' 
              ? (structure?.segments?.length || 0)
              : view === 'topics'
              ? (structure?.topics?.length || 0)
              : (structure?.narratives?.length || 0)
            
            return (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{viewLabels[view]}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isActive ? 'bg-primary-200 text-primary-800' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {!hasItems ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-500">
          Nincs {viewLabels[currentView].toLowerCase()} definiálva
        </div>
      ) : (
        <div className="space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrev
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex-1 mx-4 text-center">
              <div className="text-xs text-gray-500 mb-1">
                {currentIndex + 1} / {items.length}
              </div>
              <div className="flex items-center justify-center gap-1">
                {items.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex ? 'w-6 bg-primary-600' : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[120px]">
            {currentView === 'segments' && currentItem && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{currentItem.name}</h4>
                  {currentItem.short_label && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {currentItem.short_label}
                    </span>
                  )}
                </div>
                {currentItem.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{currentItem.description}</p>
                )}
                {currentItem.priority && (
                  <div className="text-xs text-gray-500">
                    Prioritás: <span className="font-medium capitalize">{currentItem.priority}</span>
                  </div>
                )}
              </div>
            )}

            {currentView === 'topics' && currentItem && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{currentItem.name}</h4>
                  {currentItem.short_label && (
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                      {currentItem.short_label}
                    </span>
                  )}
                </div>
                {currentItem.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{currentItem.description}</p>
                )}
                {currentItem.topic_type && (
                  <div className="text-xs text-gray-500">
                    Típus: <span className="font-medium capitalize">{currentItem.topic_type}</span>
                  </div>
                )}
                {currentItem.priority && (
                  <div className="text-xs text-gray-500">
                    Prioritás: <span className="font-medium capitalize">{currentItem.priority}</span>
                  </div>
                )}
              </div>
            )}

            {currentView === 'narratives' && currentItem && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{currentItem.title}</h4>
                  {currentItem.priority && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                      Prioritás: {currentItem.priority}
                    </span>
                  )}
                </div>
                {currentItem.description && (
                  <p className="text-sm text-gray-600 line-clamp-4">{currentItem.description}</p>
                )}
                {currentItem.suggested_phase && (
                  <div className="text-xs text-gray-500">
                    Javasolt fázis: <span className="font-medium capitalize">{currentItem.suggested_phase}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

