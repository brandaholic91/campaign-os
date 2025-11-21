import { createClient } from '@/lib/supabase/server'
import SprintBoard from '@/components/sprints/SprintBoard'
import { notFound } from 'next/navigation'

export default async function SprintsPage({
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

  const { data: sprints } = await db
    .from('sprints')
    .select('*')
    .eq('campaign_id', id)
    .order('start_date', { ascending: true })

  const { data: tasks } = await db
    .from('tasks')
    .select('*')
    .eq('campaign_id', id)

  const { data: channels } = await db
    .from('channels')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sprints & Tasks</h1>
        <p className="text-muted-foreground">
          Manage sprints and track tasks for {campaign.name}.
        </p>
      </div>

      <SprintBoard
        campaignId={id}
        sprints={sprints || []}
        tasks={tasks || []}
        channels={channels || []}
      />
    </div>
  )
}
