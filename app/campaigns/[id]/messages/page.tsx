import { createClient } from '@/lib/supabase/server'
import MessageMatrix, { StrategyRow } from '@/components/messages/MessageMatrix'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function MessageMatrixPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const db = supabase.schema('campaign_os')

  const { data: campaign } = await db
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) {
    notFound()
  }

  const { data: segments } = await db
    .from('segments')
    .select('*')
    .eq('campaign_id', id)
    .order('priority', { ascending: true })

  const { data: topics } = await db
    .from('topics')
    .select('*')
    .eq('campaign_id', id)
    .order('name', { ascending: true })

  // Fetch strategies instead of messages
  // Note: We use 'any' here because the types might not be generated yet for the new table
  // @ts-ignore
  const { data: strategiesRaw } = await (db as any)
    .from('message_strategies')
    .select('*')
    .eq('campaign_id', id)

  // Transform database format to StrategyRow format
  const strategies: StrategyRow[] = (strategiesRaw || []).map((s: any) => ({
    id: s.id,
    campaign_id: s.campaign_id,
    segment_id: s.segment_id,
    topic_id: s.topic_id,
    content: {
      strategy_core: s.strategy_core,
      style_tone: s.style_tone,
      cta_funnel: s.cta_funnel,
      extra_fields: s.extra_fields || undefined,
      preview_summary: s.preview_summary || undefined,
    },
    created_at: s.created_at,
    updated_at: s.updated_at,
  }))

  // Debug: log strategies count (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MessageMatrix] Loaded ${strategies.length} strategies for campaign ${id}`)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-gray-900">
      <div className="max-w-[1800px] mx-auto w-full px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <Link href={`/campaigns/${id}`}>
            <button className="self-start flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-primary-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Vissza a kampányhoz
            </button>
          </Link>
        </div>

        <MessageMatrix
          campaignId={id}
          segments={segments || []}
          topics={topics || []}
          strategies={strategies}
        />
      </div>
    </div>
  )
}
