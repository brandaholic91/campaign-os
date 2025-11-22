import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopicManager } from '@/components/topics/TopicManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface TopicsPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string) {
  const supabase = await createClient()
  const db = supabase.schema('campaign_os')
  const { data } = await db
    .from('campaigns')
    .select('id, name')
    .eq('id', id)
    .single()

  return data
}

export default async function TopicsPage({ params }: TopicsPageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="max-w-[1800px] mx-auto w-full px-6 py-8 flex flex-col gap-8 animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link href={`/campaigns/${id}`}>
          <button className="self-start flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-primary-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Vissza a kampányhoz
          </button>
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-500 mt-1">Témák kezelése</p>
          </div>
        </div>
      </div>

      <TopicManager campaignId={id} />
    </div>
  )
}

