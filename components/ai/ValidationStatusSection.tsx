'use client'

import { useState, useEffect } from 'react'
import { CompactExecutionReadinessChecklist } from './CompactExecutionReadinessChecklist'
import type { ExecutionReadinessResult } from '@/lib/validation/campaign-structure'
import type { CampaignStructure } from '@/lib/validation/campaign-structure'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface ValidationStatusSectionProps {
  campaignId: string
}

export function ValidationStatusSection({ campaignId }: ValidationStatusSectionProps) {
  const [validationStatus, setValidationStatus] = useState<ExecutionReadinessResult | null>(null)
  const [structure, setStructure] = useState<CampaignStructure | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchValidation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch both validation status and structure
      const [validationResponse, structureResponse] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}/validation`),
        fetch(`/api/campaigns/${campaignId}/structure`),
      ])

      if (!validationResponse.ok) {
        throw new Error('Failed to fetch validation status')
      }

      if (!structureResponse.ok) {
        throw new Error('Failed to fetch campaign structure')
      }

      const validationData = await validationResponse.json()
      const structureData = await structureResponse.json()
      
      setValidationStatus(validationData)
      setStructure(structureData)
    } catch (err) {
      console.error('Failed to fetch validation:', err)
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchValidation()
  }, [campaignId])

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Validáció betöltése...</span>
        </div>
      </div>
    )
  }

  if (error || !validationStatus || !structure) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-soft">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span>Hiba történt a validáció betöltése során: {error || 'Ismeretlen hiba'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CompactExecutionReadinessChecklist
        campaignId={campaignId}
        structure={structure}
        validationStatus={validationStatus}
      />
    </div>
  )
}

