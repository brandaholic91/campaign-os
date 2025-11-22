import React from 'react'
import { MessageStrategy } from '@/lib/ai/schemas'
import { StrategyPreviewCard } from './StrategyPreviewCard'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StrategyCellProps {
  strategy?: MessageStrategy
  isLoading?: boolean
  onClick?: () => void
  onGenerate?: (e: React.MouseEvent) => void
  onCreate?: (e: React.MouseEvent) => void
}

export function StrategyCell({ 
  strategy, 
  isLoading, 
  onClick,
  onGenerate,
  onCreate
}: StrategyCellProps) {
  
  if (isLoading) {
    return (
      <div className="h-full min-h-[200px] p-5 bg-gray-50/30 flex flex-col gap-4 border-r border-b border-gray-100 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-100 rounded-full w-16"></div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          <div className="h-3 bg-gray-50 rounded w-full"></div>
          <div className="h-3 bg-gray-50 rounded w-5/6"></div>
        </div>
        <div className="mt-auto flex gap-2">
          <div className="h-5 bg-gray-100 rounded w-12"></div>
          <div className="h-5 bg-gray-100 rounded w-16"></div>
        </div>
      </div>
    )
  }

  if (strategy) {
    return (
      <div className="h-full min-h-[200px] p-4 border-r border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors">
        <StrategyPreviewCard 
          strategy={strategy} 
          onClick={onClick}
          className="h-full shadow-none border-0 bg-transparent hover:shadow-none"
        />
      </div>
    )
  }

  return (
    <div 
      className="group h-full min-h-[200px] p-6 flex flex-col items-center justify-center border-r border-b border-gray-100 bg-white hover:bg-gray-50/30 transition-colors text-center"
    >
      <div className="mb-4">
        <span className="text-sm text-gray-400 font-medium">Nincs stratégia</span>
      </div>
      
      <div className="flex flex-col gap-2 w-full max-w-[180px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200"
          onClick={onGenerate}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generálás
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full gap-2 text-gray-500 hover:text-gray-900"
          onClick={onCreate}
        >
          <Plus className="w-3.5 h-3.5" />
          Létrehozás
        </Button>
      </div>
    </div>
  )
}
