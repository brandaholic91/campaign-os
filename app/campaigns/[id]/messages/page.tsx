import { createClient } from '@/lib/supabase/server'
import MessageMatrix from '@/components/messages/MessageMatrix'
import { notFound } from 'next/navigation'

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

  const { data: messages } = await db
    .from('messages')
    .select('*')
    .eq('campaign_id', id)

  return (
    <MessageMatrix
      campaignId={id}
      segments={segments || []}
      topics={topics || []}
      messages={messages || []}
    />
  )
}
