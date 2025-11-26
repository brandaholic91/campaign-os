'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Users, Hash, MessageSquare, Target } from 'lucide-react'
import type { CampaignStructure, Goal, Narrative, Segment, Topic } from '@/lib/validation/campaign-structure'

interface CampaignOverviewCardProps {
  campaignId: string
}

type ViewType = 'segments' | 'topics' | 'narratives' | 'goals'

export function CampaignOverviewCard({ campaignId }: CampaignOverviewCardProps) {
  const [structure, setStructure] = useState<CampaignStructure | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('segments')
  const [currentIndex, setCurrentIndex] = useState(0)
  
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

  useEffect(() => {
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
      case 'goals':
        return structure.goals || []
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
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-soft">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-gray-500">Betöltés...</div>
        </div>
      </div>
    )
  }

  const viewLabels = {
    segments: 'Célcsoportok',
    topics: 'Témák',
    narratives: 'Narratívák',
    goals: 'Célok'
  }

  const viewIcons = {
    segments: Users,
    topics: Hash,
    narratives: MessageSquare,
    goals: Target
  }

  // Helper to safely access properties
  const renderSegment = (item: Segment) => (
    <div className="space-y-2">
      <div className="pr-20">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
      </div>
      {item.short_label && (
        <span className="absolute top-4 right-4 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          {item.short_label}
        </span>
      )}
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
      )}
      {item.priority && (
        <div className="text-xs text-gray-500">
          Prioritás: <span className="font-medium capitalize">{item.priority}</span>
        </div>
      )}
    </div>
  )

  const renderTopic = (item: Topic) => (
    <div className="space-y-2">
      <div className="pr-20">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
      </div>
      {item.short_label && (
        <span className="absolute top-4 right-4 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded">
          {item.short_label}
        </span>
      )}
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
      )}
      {item.topic_type && (
        <div className="text-xs text-gray-500">
          Típus: <span className="font-medium capitalize">{item.topic_type}</span>
        </div>
      )}
      {item.priority && (
        <div className="text-xs text-gray-500">
          Prioritás: <span className="font-medium capitalize">{item.priority}</span>
        </div>
      )}
    </div>
  )

  const renderNarrative = (item: Narrative) => (
    <div className="space-y-2">
      <div className="pr-20">
        <h4 className="font-semibold text-gray-900">{item.title}</h4>
      </div>
      {item.priority && (
        <span className="absolute top-4 right-4 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
          Prioritás: {item.priority}
        </span>
      )}
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-4">{item.description}</p>
      )}
      {item.suggested_phase && (
        <div className="text-xs text-gray-500">
          Javasolt fázis: <span className="font-medium capitalize">{item.suggested_phase}</span>
        </div>
      )}
    </div>
  )

  const renderGoal = (item: Goal) => (
    <div className="space-y-2">
      <div className="pr-20">
        <h4 className="font-semibold text-gray-900">{item.title}</h4>
      </div>
      {item.priority && (
        <span className="absolute top-4 right-4 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
          Prioritás: {item.priority}
        </span>
      )}
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-4">{item.description}</p>
      )}
      <div className="flex gap-4 text-xs text-gray-500">
        {item.funnel_stage && (
          <div>
            Funnel: <span className="font-medium capitalize">{item.funnel_stage}</span>
          </div>
        )}
        {item.kpi_hint && (
          <div>
            KPI: <span className="font-medium">{item.kpi_hint}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-gray-900">Áttekintés</h3>
        <div className="flex items-center gap-1">
          {(['goals', 'segments', 'topics', 'narratives'] as ViewType[]).map((view) => {
            const Icon = viewIcons[view]
            const isActive = currentView === view
            const count = view === 'segments' 
              ? (structure?.segments?.length || 0)
              : view === 'topics'
              ? (structure?.topics?.length || 0)
              : view === 'narratives'
              ? (structure?.narratives?.length || 0)
              : (structure?.goals?.length || 0)
            
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
                <span className="hidden md:inline">{viewLabels[view]}</span>
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
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[120px] relative group">
            {currentView === 'segments' && renderSegment(currentItem as Segment)}
            {currentView === 'topics' && renderTopic(currentItem as Topic)}
            {currentView === 'narratives' && renderNarrative(currentItem as Narrative)}
            {currentView === 'goals' && renderGoal(currentItem as Goal)}
          </div>
        </div>
      )}
    </div>
  )
}
