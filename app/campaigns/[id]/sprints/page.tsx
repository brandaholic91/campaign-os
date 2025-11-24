import { createClient } from '@/lib/supabase/server'
import SprintBoard from '@/components/sprints/SprintBoard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

  // Transform sprints to match SprintBoard type (null -> undefined for optional fields)
  const transformedSprints = (sprints || []).map(sprint => ({
    ...sprint,
    status: sprint.status ?? undefined,
    created_at: sprint.created_at ?? undefined,
    updated_at: sprint.updated_at ?? undefined,
  }))

  // Transform tasks to match SprintBoard type (null -> undefined for optional fields)
  const transformedTasks = (tasks || []).map(task => ({
    ...task,
    status: task.status ?? undefined,
    created_at: task.created_at ?? undefined,
    updated_at: task.updated_at ?? undefined,
  }))

  // Transform channels to match SprintBoard type (null -> undefined for optional fields)
  const transformedChannels = (channels || []).map(channel => ({
    ...channel,
    created_at: channel.created_at ?? undefined,
    updated_at: channel.updated_at ?? undefined,
  }))

  return (
    <div className="max-w-[1800px] mx-auto w-full px-6 py-8 flex flex-col gap-8 animate-in slide-in-from-right duration-500 h-[calc(100vh-64px)]">
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
            <h1 className="text-3xl font-display font-bold text-gray-900">Sprints & Tasks</h1>
            <p className="text-gray-500 mt-1">Manage sprints and track tasks for {campaign.name}.</p>
          </div>
        </div>
      </div>

      <SprintBoard
        campaignId={id}
        sprints={transformedSprints}
        tasks={transformedTasks}
        channels={transformedChannels}
      />
    </div>
  )
}
