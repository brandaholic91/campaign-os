import { useMemo } from 'react'
import { useCopilotReadable } from '@copilotkit/react-core'

export interface CampaignFormInputs {
  name?: string
  campaign_type?: string
  primary_goal_type?: string
  start_date?: string
  end_date?: string
  description?: string | null
  budget_estimate?: number
  current_step?: number
  existing_segments?: Array<Record<string, unknown>>
  existing_topics?: Array<Record<string, unknown>>
  existing_messages?: Array<Record<string, unknown>>
}

export interface CampaignFormState {
  current_step: number
  campaign_type: string
  goal_type: string
  start_date: string
  end_date: string
  form_fields: {
    name: string
    description: string
    budget_estimate?: number
  }
  existing_segments: Array<Record<string, unknown>>
  existing_topics: Array<Record<string, unknown>>
  existing_messages: Array<Record<string, unknown>>
}

export function buildCampaignFormState(inputs: CampaignFormInputs): CampaignFormState {
  return {
    current_step: inputs.current_step ?? 1,
    campaign_type: inputs.campaign_type ?? 'brand_awareness',
    goal_type: inputs.primary_goal_type ?? 'awareness',
    start_date: inputs.start_date ?? '',
    end_date: inputs.end_date ?? '',
    form_fields: {
      name: inputs.name ?? '',
      description: inputs.description ?? '',
      budget_estimate: inputs.budget_estimate,
    },
    existing_segments: inputs.existing_segments ?? [],
    existing_topics: inputs.existing_topics ?? [],
    existing_messages: inputs.existing_messages ?? [],
  }
}

export function useCampaignFormCopilotState(inputs: CampaignFormInputs) {
  const state = useMemo(
    () => buildCampaignFormState(inputs),
    [
      inputs.name,
      inputs.campaign_type,
      inputs.primary_goal_type,
      inputs.start_date,
      inputs.end_date,
      inputs.description,
      inputs.budget_estimate,
      inputs.current_step,
      inputs.existing_segments,
      inputs.existing_topics,
      inputs.existing_messages,
    ]
  )
  useCopilotReadable(
    {
      description: 'Campaign form AG-UI state snapshot',
      value: state,
      categories: ['campaign-form', 'ag-ui'],
      available: 'enabled',
    },
    [state]
  )
  return state
}

