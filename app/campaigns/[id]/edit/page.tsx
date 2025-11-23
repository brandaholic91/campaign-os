import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditCampaignClient from './EditCampaignClient'
import { Database } from '@/lib/supabase/types'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']

interface EditCampaignPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  const db = supabase.schema('campaign_os')
  const { data, error } = await db
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  return <EditCampaignClient campaign={campaign} />
}

