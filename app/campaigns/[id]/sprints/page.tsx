import { createClient } from '@/lib/supabase/server'
import SprintBoard from '@/components/sprints/SprintBoard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Sprint = Database['campaign_os']['Tables']['sprints']['Row'] & {
  focus_segments?: string[]
  focus_topics?: string[]
  focus_channels?: string[]
  success_indicators?: any[]
}

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

  // Fetch sprints with related data from junction tables
  const { data: sprints } = await db
    .from('sprints')
    .select('*')
    .eq('campaign_id', id)
    .order('start_date', { ascending: true })

  // For each sprint, fetch related segments, topics, and channels
  const sprintsWithRelations = await Promise.all((sprints || []).map(async (sprint) => {
    const { data: sprintSegments } = await db
      .from('sprint_segments')
      .select('segment_id')
      .eq('sprint_id', sprint.id)

    const { data: sprintTopics } = await db
      .from('sprint_topics')
      .select('topic_id')
      .eq('sprint_id', sprint.id)

    const { data: sprintChannels } = await db
      .from('sprint_channels')
      .select('channel_key')
      .eq('sprint_id', sprint.id)

    // Get channel keys from junction table as string array
    const channelKeys = (sprintChannels || []).map((c: any) => c.channel_key)
    
    // Build the sprint object with all fields, ensuring JSON fields are preserved
    return {
      ...sprint,
      focus_segments: (sprintSegments || []).map((s: any) => s.segment_id),
      focus_topics: (sprintTopics || []).map((t: any) => t.topic_id),
      // Override focus_channels with array from junction table (SprintForm expects string[])
      focus_channels: channelKeys.length > 0 ? channelKeys : (Array.isArray(sprint.focus_channels) ? sprint.focus_channels : []),
    } as Sprint
  }))

  const { data: tasks } = await db
    .from('tasks')
    .select('*')
    .eq('campaign_id', id)

  const { data: channels } = await db
    .from('channels')
    .select('*')
    .order('name', { ascending: true })

  // The sprintsWithRelations already have all DB fields plus junction table data
  // Cast to Sprint[] type (each sprint is already cast as Sprint in the map function above)
  const transformedSprints: Sprint[] = sprintsWithRelations

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
