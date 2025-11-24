'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import type { ExecutionReadinessResult } from '@/lib/validation/campaign-structure'

interface ValidationStatusBadgeProps {
  campaignId: string
}

export function ValidationStatusBadge({ campaignId }: ValidationStatusBadgeProps) {
  const [validationStatus, setValidationStatus] = useState<ExecutionReadinessResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchValidation = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/validation`)
        if (response.ok) {
          const data = await response.json()
          setValidationStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch validation status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchValidation()
  }, [campaignId])

  if (isLoading) {
    return (
      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200 uppercase tracking-wide flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Validáció...
      </span>
    )
  }

  if (!validationStatus) {
    return null
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide flex items-center gap-1 ${
        validationStatus.ready
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
      }`}
    >
      {validationStatus.ready ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Kész
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" />
          Nem Kész
        </>
      )}
    </span>
  )
}

