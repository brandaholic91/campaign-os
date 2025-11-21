'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Database } from '@/lib/supabase/types'
import { useCampaignFormCopilotState } from '@/lib/ai/copilot-state'

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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save campaign')
      }

      if (onSuccess) {
        onSuccess()
      } else {
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

  useCampaignFormCopilotState({
    ...formData,
    budget_estimate: formData.budget_estimate ?? undefined, // Convert null to undefined
    current_step: 1,
    existing_segments: [],
    existing_topics: [],
    existing_messages: [],
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Kampány neve *</Label>
        <Input
          id="name"
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
            <SelectTrigger id="campaign_type">
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
            <SelectTrigger id="primary_goal_type">
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
          {loading ? 'Mentés...' : campaign ? 'Frissítés' : 'Létrehozás'}
        </Button>
        <Button
          type="button"
          className="border border-input bg-background hover:bg-accent"
          onClick={() => router.back()}
          disabled={loading}
        >
          Mégse
        </Button>
      </div>
    </form>
  )
}

