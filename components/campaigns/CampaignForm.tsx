'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Database } from '@/lib/supabase/types'
import { useCampaignFormCopilotState } from '@/lib/ai/copilot-state'
import { AssistantChat } from '@/components/ai/AssistantChat'
import { useCopilotAction } from '@copilotkit/react-core'
import { highlightField, prefillField, navigateToStep, openSuggestionModal, type SuggestionModalPayload } from '@/lib/ai/copilotkit/tools'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']
type CampaignInsert = Database['campaign_os']['Tables']['campaigns']['Insert']

interface CampaignFormProps {
  campaign?: Campaign
  onSuccess?: () => void
}

const campaignTypes: Campaign['campaign_type'][] = [
  'political_election',
  'political_issue',
  'brand_awareness',
  'product_launch',
  'promo',
  'ngo_issue',
]

const goalTypes: Campaign['primary_goal_type'][] = [
  'awareness',
  'engagement',
  'list_building',
  'conversion',
  'mobilization',
]

const campaignTypeLabels: Record<Campaign['campaign_type'], string> = {
  political_election: 'Politikai választás',
  political_issue: 'Politikai ügy',
  brand_awareness: 'Márkaismertség',
  product_launch: 'Termék bevezetés',
  promo: 'Promóció',
  ngo_issue: 'NGO ügy',
}

const goalTypeLabels: Record<Campaign['primary_goal_type'], string> = {
  awareness: 'Tudatosság',
  engagement: 'Engedélyezés',
  list_building: 'Listaépítés',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const EMPTY_ARRAYS = {
  existing_segments: [] as Array<Record<string, unknown>>,
  existing_topics: [] as Array<Record<string, unknown>>,
  existing_messages: [] as Array<Record<string, unknown>>,
}

export function CampaignForm({ campaign, onSuccess }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CampaignInsert>>({
    name: campaign?.name || '',
    campaign_type: campaign?.campaign_type || 'brand_awareness',
    start_date: campaign?.start_date ? campaign.start_date.split('T')[0] : '',
    end_date: campaign?.end_date ? campaign.end_date.split('T')[0] : '',
    primary_goal_type: campaign?.primary_goal_type || 'awareness',
    description: campaign?.description || '',
    budget_estimate: campaign?.budget_estimate || undefined,
    status: campaign?.status || 'planning',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Date validation
      if (formData.start_date && formData.end_date) {
        const startDate = new Date(formData.start_date)
        const endDate = new Date(formData.end_date)
        if (endDate <= startDate) {
          setError('A befejezési dátumnak a kezdési dátum után kell lennie')
          setLoading(false)
          return
        }
      }

      const url = campaign 
        ? `/api/campaigns/${campaign.id}`
        : '/api/campaigns'
      
      const method = campaign ? 'PUT' : 'POST'

      // Remove undefined values from formData
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined)
      )

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedFormData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save campaign')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        toast.success(campaign ? 'Kampány sikeresen frissítve!' : 'Kampány sikeresen létrehozva!')
        router.push('/campaigns')
        router.refresh()
      }
    } catch (err) {
      console.error('Error saving campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  // Build CopilotKit state inputs for bi-directional state sync (AC: #2, #8)
  const copilotStateInputs = useMemo(
    () => ({
      ...formData,
      budget_estimate: formData.budget_estimate ?? undefined, // Convert null to undefined
      current_step: 1,
      existing_segments: EMPTY_ARRAYS.existing_segments,
      existing_topics: EMPTY_ARRAYS.existing_topics,
      existing_messages: EMPTY_ARRAYS.existing_messages,
    }),
    [
      formData.name,
      formData.campaign_type,
      formData.primary_goal_type,
      formData.start_date,
      formData.end_date,
      formData.description,
      formData.budget_estimate,
    ]
  )

  // Expose form state to CopilotKit agent for real-time state sync (AC: #2, #8)
  useCampaignFormCopilotState(copilotStateInputs)

  // Register frontend tools for agent interaction (AC: #3, #4, #5)
  useCopilotAction({
    name: 'highlightField',
    description: 'Highlight a form field to draw user attention',
    parameters: [
      {
        name: 'fieldId',
        type: 'string' as const,
        description: 'The data-field-id attribute value of the field to highlight',
        required: true,
      },
      {
        name: 'duration',
        type: 'number' as const,
        description: 'Duration in milliseconds (default: 3000)',
        required: false,
      },
      {
        name: 'color',
        type: 'string' as const,
        description: 'CSS color for highlight (default: yellow)',
        required: false,
      },
    ],
    handler: ({ fieldId, duration, color }: { fieldId: string; duration?: number; color?: string }) => {
      highlightField(fieldId, { duration, color })
      return { success: true, message: `Highlighted field: ${fieldId}` }
    },
  })

  useCopilotAction({
    name: 'prefillField',
    description: 'Prefill a form field with a suggested value',
    parameters: [
      {
        name: 'fieldId',
        type: 'string' as const,
        description: 'The data-field-id attribute value of the field to prefill',
        required: true,
      },
      {
        name: 'value',
        type: 'string' as const,
        description: 'The value to prefill',
        required: true,
      },
    ],
    handler: ({ fieldId, value }: { fieldId: string; value: string }) => {
      prefillField(fieldId, value)
      // Update form state after prefill
      const fieldMap: Record<string, keyof typeof formData> = {
        name: 'name',
        description: 'description',
        campaign_type: 'campaign_type',
        primary_goal_type: 'primary_goal_type',
        start_date: 'start_date',
        end_date: 'end_date',
        budget_estimate: 'budget_estimate',
      }
      const formKey = fieldMap[fieldId]
      if (formKey) {
        if (formKey === 'budget_estimate') {
          setFormData((prev) => ({ ...prev, [formKey]: parseFloat(value) || undefined }))
        } else {
          setFormData((prev) => ({ ...prev, [formKey]: value as any }))
        }
      }
      return { success: true, message: `Prefilled field: ${fieldId} with value: ${value}` }
    },
  })

  useCopilotAction({
    name: 'navigateToStep',
    description: 'Navigate to a specific step in a multi-step wizard',
    parameters: [
      {
        name: 'stepId',
        type: 'string' as const,
        description: 'Step identifier (e.g., "step-1", "step-2")',
        required: true,
      },
    ],
    handler: ({ stepId }: { stepId: string }) => {
      navigateToStep(stepId)
      return { success: true, message: `Navigated to step: ${stepId}` }
    },
  })

  useCopilotAction({
    name: 'openSuggestionModal',
    description: 'Open a modal with suggestions or information',
    parameters: [
      {
        name: 'type',
        type: 'string' as const,
        description: 'Modal type (e.g., "suggestion")',
        required: true,
      },
      {
        name: 'title',
        type: 'string' as const,
        description: 'Modal title',
        required: false,
      },
      {
        name: 'content',
        type: 'string' as const,
        description: 'Modal content',
        required: true,
      },
      {
        name: 'payloadType',
        type: 'string' as const,
        description: 'Payload type (info, success, warning, error)',
        required: false,
      },
    ],
    handler: ({ type, title, content, payloadType }: { type: string; title?: string; content: string; payloadType?: string }) => {
      const payload: SuggestionModalPayload = { 
        title, 
        content, 
        type: payloadType as 'info' | 'success' | 'warning' | 'error' | undefined 
      }
      openSuggestionModal(type, payload)
      return { success: true, message: `Opened ${type} modal` }
    },
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Kampány neve *</Label>
        <Input
          id="name"
          data-field-id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Pl. 2024-es választási kampány"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaign_type">Kampány típusa *</Label>
          <Select
            value={formData.campaign_type}
            onValueChange={(value) => setFormData({ ...formData, campaign_type: value as Campaign['campaign_type'] })}
            required
          >
            <SelectTrigger id="campaign_type" data-field-id="campaign_type">
              <SelectValue placeholder="Válassz típust" />
            </SelectTrigger>
            <SelectContent>
              {campaignTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {campaignTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_goal_type">Elsődleges cél *</Label>
          <Select
            value={formData.primary_goal_type}
            onValueChange={(value) => setFormData({ ...formData, primary_goal_type: value as Campaign['primary_goal_type'] })}
            required
          >
            <SelectTrigger id="primary_goal_type" data-field-id="primary_goal_type">
              <SelectValue placeholder="Válassz célt" />
            </SelectTrigger>
            <SelectContent>
              {goalTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {goalTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Kezdési dátum *</Label>
          <Input
            id="start_date"
            data-field-id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Befejezési dátum *</Label>
          <Input
            id="end_date"
            data-field-id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Leírás</Label>
        <Textarea
          id="description"
          data-field-id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          placeholder="Kampány rövid leírása..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_estimate">Költségvetési becslés</Label>
        <Input
          id="budget_estimate"
          data-field-id="budget_estimate"
          type="number"
          value={formData.budget_estimate || ''}
          onChange={(e) => setFormData({ ...formData, budget_estimate: e.target.value ? parseFloat(e.target.value) : undefined })}
          placeholder="0"
          min="0"
          step="0.01"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mentés...
            </>
          ) : (
            campaign ? 'Frissítés' : 'Létrehozás'
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Mégse
        </Button>
      </div>

      {/* Kampánysegéd Assistant Chat - AC: #1, #2, #6, #8 */}
      <AssistantChat 
        campaignType={formData.campaign_type}
        goalType={formData.primary_goal_type}
        formFields={{
          name: formData.name,
          description: formData.description || undefined,
          budget_estimate: formData.budget_estimate ?? undefined,
        }}
      />
    </form>
  )
}

