'use client'

import { ReactNode } from 'react'
import { CopilotKit } from '@copilotkit/react-core'

/**
 * CampaignAssistant wrapper component
 * Wraps campaign creation/editing forms with CopilotKit provider and context
 * AC: #1, #8
 */
interface CampaignAssistantProps {
  children: ReactNode
  campaignId?: string
  campaignType?: string
  goalType?: string
}

export function CampaignAssistant({ 
  children, 
  campaignId,
  campaignType,
  goalType 
}: CampaignAssistantProps) {
  // Get runtime URL from environment or use default
  const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL || '/api/copilotkit'

  // Build context properties for the agent
  const properties = {
    campaignId,
    campaignType,
    goalType,
  }

  return (
    <CopilotKit 
      runtimeUrl={runtimeUrl}
      properties={properties}
    >
      {children}
    </CopilotKit>
  )
}

