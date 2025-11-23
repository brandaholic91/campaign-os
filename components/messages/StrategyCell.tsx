import React from 'react'
import { MessageStrategy } from '@/lib/ai/schemas'
import { StrategyPreviewCard } from './StrategyPreviewCard'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Database } from '@/lib/supabase/types'

type MatrixEntry = Database['campaign_os']['Tables']['segment_topic_matrix']['Row']

interface StrategyCellProps {
  strategy?: MessageStrategy
  matrixEntry?: MatrixEntry
  isLoading?: boolean
  onClick?: () => void
  onGenerate?: (e: React.MouseEvent) => void
  onCreate?: (e: React.MouseEvent) => void
}

export function StrategyCell({ 
  strategy, 
  matrixEntry,
  isLoading, 
  onClick,
  onGenerate,
  onCreate
}: StrategyCellProps) {
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[StrategyCell] Rendering with strategy:', !!strategy, strategy ? Object.keys(strategy) : null)
  }
  
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
    if (process.env.NODE_ENV === 'development') {
      console.log('[StrategyCell] Rendering strategy cell with strategy:', {
        hasStrategy: !!strategy,
        strategyKeys: Object.keys(strategy),
        strategyCore: strategy.strategy_core ? Object.keys(strategy.strategy_core) : null
      })
    }
    return (
      <div className="h-full min-h-[200px] p-4 border-r border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors relative group">
        {matrixEntry && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             <span className={cn(
               "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
               matrixEntry.importance === 'high' ? "bg-rose-50 text-rose-600 border-rose-100" :
               matrixEntry.importance === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
               "bg-gray-50 text-gray-500 border-gray-100"
             )}>
               {matrixEntry.importance}
             </span>
          </div>
        )}
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
      className="group h-full min-h-[200px] p-6 flex flex-col items-center justify-center border-r border-b border-gray-100 bg-white hover:bg-gray-50/30 transition-colors text-center relative"
    >
      {matrixEntry ? (
        <div className="flex flex-col items-center gap-3 mb-4 w-full">
          <div className="flex gap-2">
            <span className={cn(
               "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
               matrixEntry.importance === 'high' ? "bg-rose-50 text-rose-600 border-rose-100" :
               matrixEntry.importance === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
               "bg-gray-50 text-gray-500 border-gray-100"
             )}>
               {matrixEntry.importance}
             </span>
             <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-blue-50 text-blue-600 border-blue-100">
               {matrixEntry.role}
             </span>
          </div>
          {matrixEntry.summary && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 max-w-[200px]">
              {matrixEntry.summary}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <span className="text-sm text-gray-400 font-medium">Nincs stratégia</span>
        </div>
      )}
      
      <div className="flex flex-col gap-2 w-full max-w-[180px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
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
