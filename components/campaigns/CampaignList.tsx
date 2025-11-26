'use client'

import { useEffect, useState } from 'react'
import { CampaignCard } from './CampaignCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch('/api/campaigns')
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns')
        }
        const data = await response.json()
        setCampaigns(data)
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError(err instanceof Error ? err.message : 'Failed to load campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-destructive">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Újrapróbálás
        </Button>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-muted-foreground text-center">
          <p className="text-lg font-medium mb-2">Még nincsenek kampányok</p>
          <p className="text-sm">Hozz létre egy új kampányt a kezdéshez</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Link href="/campaigns/new/ai" className="w-full md:w-auto">
            <Button variant="outline" className="w-full md:w-auto">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Tervező
            </Button>
          </Link>
          <Link href="/campaigns/new" className="w-full md:w-auto">
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Új kampány
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Kampányok</h2>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Link href="/campaigns/new/ai" className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Tervező
              </Button>
            </Link>
            <Link href="/campaigns/new" className="w-full md:w-auto">
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Új kampány
              </Button>
            </Link>
          </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  )
}

