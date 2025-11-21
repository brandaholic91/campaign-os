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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Message Matrix</h1>
        <p className="text-muted-foreground">
          Manage messages for {campaign.name} across segments and topics.
        </p>
      </div>

      <MessageMatrix
        campaignId={id}
        segments={segments || []}
        topics={topics || []}
        messages={messages || []}
      />
    </div>
  )
}
