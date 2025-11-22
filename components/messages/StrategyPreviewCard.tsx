import React from 'react'
import { MessageStrategy } from '@/lib/ai/schemas'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StrategyPreviewCardProps {
  strategy: MessageStrategy
  className?: string
  onClick?: () => void
}

export function StrategyPreviewCard({ strategy, className, onClick }: StrategyPreviewCardProps) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[StrategyPreviewCard] Rendering with strategy:', {
      hasStrategy: !!strategy,
      hasStrategyCore: !!strategy?.strategy_core,
      hasStyleTone: !!strategy?.style_tone,
      hasCtaFunnel: !!strategy?.cta_funnel,
      strategyKeys: strategy ? Object.keys(strategy) : null
    })
  }

  if (!strategy || !strategy.strategy_core || !strategy.style_tone || !strategy.cta_funnel) {
    console.error('[StrategyPreviewCard] Missing required strategy fields:', {
      hasStrategy: !!strategy,
      hasStrategyCore: !!strategy?.strategy_core,
      hasStyleTone: !!strategy?.style_tone,
      hasCtaFunnel: !!strategy?.cta_funnel
    })
    return (
      <div className="p-4 text-sm text-red-600">
        Hiba: Hiányzó stratégia adatok
      </div>
    )
  }

  const { strategy_core, style_tone, cta_funnel } = strategy

  if (process.env.NODE_ENV === 'development') {
    console.log('[StrategyPreviewCard] Strategy data:', {
      positioning_statement: strategy_core?.positioning_statement?.substring(0, 50),
      core_message: strategy_core?.core_message?.substring(0, 50),
      funnel_stage: cta_funnel?.funnel_stage,
      keywords: style_tone?.tone_profile?.keywords
    })
  }

  // Truncate positioning statement to first 1-2 sentences (approx 150 chars)
  const truncatedPositioning = strategy_core.positioning_statement?.length > 150
    ? strategy_core.positioning_statement.substring(0, 150) + '...'
    : (strategy_core.positioning_statement || 'Nincs positioning statement')

  const funnelColors = {
    awareness: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    consideration: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    conversion: 'bg-green-100 text-green-800 hover:bg-green-200',
    mobilization: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  }

  return (
    <Card 
      className={cn(
        "h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col", 
        className
      )}
      onClick={onClick}
      style={{ minHeight: '200px' }}
    >
      <CardHeader className="pb-2 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={cn("capitalize border-0", funnelColors[cta_funnel.funnel_stage])}>
            {cta_funnel.funnel_stage}
          </Badge>
        </div>
        <CardTitle className="text-sm font-bold leading-tight">
          {strategy_core.core_message || 'Nincs core message'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground line-clamp-3">
          {truncatedPositioning}
        </p>
        
        <div className="mt-auto flex flex-wrap gap-1">
          {style_tone.tone_profile.keywords.slice(0, 3).map((keyword, i) => (
            <span 
              key={i} 
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600"
            >
              {keyword}
            </span>
          ))}
          {style_tone.tone_profile.keywords.length > 3 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-400">
              +{style_tone.tone_profile.keywords.length - 3}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
