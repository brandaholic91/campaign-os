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
  const { data: strategies } = await (db as any)
    .from('message_strategies')
    .select('*')
    .eq('campaign_id', id)

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
          strategies={(strategies as unknown as StrategyRow[]) || []}
        />
      </div>
    </div>
  )
}
