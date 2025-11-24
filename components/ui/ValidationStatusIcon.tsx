'use client'

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ValidationStatus = 'complete' | 'partial' | 'missing'

interface ValidationStatusIconProps {
  status: ValidationStatus
  tooltip?: string
  className?: string
}

export function ValidationStatusIcon({ 
  status, 
  tooltip, 
  className 
}: ValidationStatusIconProps) {
  const iconConfig = {
    complete: {
      Icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    partial: {
      Icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    missing: {
      Icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  }

  const config = iconConfig[status]
  const { Icon } = config

  return (
    <div 
      className={cn(
        'inline-flex items-center justify-center rounded-full p-1',
        config.bgColor,
        className
      )}
      title={tooltip}
    >
      <Icon 
        className={cn('h-4 w-4', config.color)} 
        aria-label={`Validation status: ${status}`}
      />
    </div>
  )
}

