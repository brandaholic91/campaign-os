'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmptyStrategyStateProps {
  campaignId: string
  segmentId?: string
  topicId?: string
}

export function EmptyStrategyState({ campaignId, segmentId, topicId }: EmptyStrategyStateProps) {
  const router = useRouter()

  const handleCreateStrategy = () => {
    const params = new URLSearchParams()
    if (segmentId) params.set('highlight_segment', segmentId)
    if (topicId) params.set('highlight_topic', topicId)
    
    router.push(`/campaigns/${campaignId}/messages?${params.toString()}`)
  }

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">Nincs stratégia generálva</p>
          <p className="text-xs text-gray-500 max-w-xs">
            Hozz létre egy kommunikációs stratégiát ehhez a célcsoport-téma kombinációhoz
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          className="mt-2"
          onClick={handleCreateStrategy}
        >
          <Plus className="h-4 w-4 mr-2" />
          Stratégia létrehozása
        </Button>
      </CardContent>
    </Card>
  )
}
