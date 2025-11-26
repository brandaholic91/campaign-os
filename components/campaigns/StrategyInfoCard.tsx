'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StrategyInfoCardProps {
  strategy: {
    id: string
    segment_name: string
    topic_name: string
    content: {
      strategy_core: {
        core_message: string
        supporting_messages?: string[]
      }
      cta_funnel: {
        funnel_stage?: string
      }
    }
  }
  campaignId: string
}

export function StrategyInfoCard({ strategy, campaignId }: StrategyInfoCardProps) {
  const router = useRouter()

  const handleViewFull = () => {
    router.push(`/campaigns/${campaignId}/messages?highlight_segment=${strategy.id}`)
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Kommunikációs Stratégia</span>
          </div>
          {strategy.content.cta_funnel.funnel_stage && (
            <Badge variant="outline" className="bg-white/80">
              {strategy.content.cta_funnel.funnel_stage}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {strategy.content.strategy_core.core_message.length > 120
              ? `${strategy.content.strategy_core.core_message.slice(0, 120)}...`
              : strategy.content.strategy_core.core_message}
          </p>

          {strategy.content.strategy_core.supporting_messages && 
           strategy.content.strategy_core.supporting_messages.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1 ml-4">
              {strategy.content.strategy_core.supporting_messages.slice(0, 3).map((msg, idx) => (
                <li key={idx} className="list-disc">
                  {msg.length > 80 ? `${msg.slice(0, 80)}...` : msg}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-purple-700 border-purple-300 hover:bg-purple-100"
          onClick={handleViewFull}
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          Teljes stratégia megtekintése
        </Button>
      </CardContent>
    </Card>
  )
}
