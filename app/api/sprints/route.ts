import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_PRIORITY = 'primary'
type Priority = typeof DEFAULT_PRIORITY | 'secondary'

interface RelationGroup {
  primary: string[]
  secondary: string[]
}

const normalizeStringArray = (value?: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? [trimmed] : []
  }
  return []
}

const ensureLengthRange = (name: string, values: string[], min: number, max: number) => {
  if (values.length < min) {
    return `${name} must contain at least ${min} entries`
  }
  if (values.length > max) {
    return `${name} cannot have more than ${max} entries`
  }
  return null
}

const ensureMaxLength = (name: string, values: string[], max: number) => {
  if (values.length > max) {
    return `${name} cannot have more than ${max} entries`
  }
  return null
}

const fetchPriorityRelations = async (
  db: any,
  table: 'sprint_segments' | 'sprint_topics' | 'sprint_channels',
  keyField: 'segment_id' | 'topic_id' | 'channel_key',
  sprintIds: string[]
) => {
  const relationMap = new Map<string, RelationGroup>()

  if (sprintIds.length === 0) {
    return relationMap
  }

  const { data, error } = await db
    .from(table)
    .select(`sprint_id, ${keyField}, priority`)
    .in('sprint_id', sprintIds)

  if (error) {
    throw error
  }

  ;(data || []).forEach((row: any) => {
    if (!row.sprint_id) return
    const key = row[keyField]
    if (!key) return
    const priority = row.priority === 'secondary' ? 'secondary' : DEFAULT_PRIORITY
    const bucket = relationMap.get(row.sprint_id) || { primary: [], secondary: [] }
    if (priority === 'secondary') {
      bucket.secondary.push(key)
    } else {
      bucket.primary.push(key)
    }
    relationMap.set(row.sprint_id, bucket)
  })

  return relationMap
}

const buildSprintPayload = (
  sprint: Record<string, any>,
  segmentsMap: Map<string, RelationGroup>,
  topicsMap: Map<string, RelationGroup>,
  channelsMap: Map<string, RelationGroup>
) => {
  const segments = segmentsMap.get(sprint.id) || { primary: [], secondary: [] }
  const topics = topicsMap.get(sprint.id) || { primary: [], secondary: [] }
  const channels = channelsMap.get(sprint.id) || { primary: [], secondary: [] }

  return {
    ...sprint,
    focus_segments: [...segments.primary, ...segments.secondary],
    focus_segments_primary: segments.primary,
    focus_segments_secondary: segments.secondary,
    focus_topics: [...topics.primary, ...topics.secondary],
    focus_topics_primary: topics.primary,
    focus_topics_secondary: topics.secondary,
    focus_channels: [...channels.primary, ...channels.secondary],
    focus_channels_primary: channels.primary,
    focus_channels_secondary: channels.secondary,
  }
}

const reduceFocusPayload = (body: Record<string, unknown>) => {
  const segmentsPrimary = normalizeStringArray(body.focus_segments_primary)
  const legacySegments = normalizeStringArray(body.focus_segments)
  const focusSegmentsPrimary = segmentsPrimary.length > 0 ? segmentsPrimary : legacySegments
  const focusSegmentsSecondary = normalizeStringArray(body.focus_segments_secondary)

  const topicsPrimary = normalizeStringArray(body.focus_topics_primary)
  const legacyTopics = normalizeStringArray(body.focus_topics)
  const focusTopicsPrimary = topicsPrimary.length > 0 ? topicsPrimary : legacyTopics
  const focusTopicsSecondary = normalizeStringArray(body.focus_topics_secondary)

  const channelsPrimary = normalizeStringArray(body.focus_channels_primary)
  const legacyChannels = normalizeStringArray(body.focus_channels)
  const focusChannelsPrimary = channelsPrimary.length > 0 ? channelsPrimary : legacyChannels
  const focusChannelsSecondary = normalizeStringArray(body.focus_channels_secondary)

  return {
    focusSegmentsPrimary,
    focusSegmentsSecondary,
    focusTopicsPrimary,
    focusTopicsSecondary,
    focusChannelsPrimary,
    focusChannelsSecondary,
  }
}

const buildPriorityRows = (
  sprintId: string,
  ids: string[],
  keyField: string,
  priority: Priority
) => ids.map(id => ({
  sprint_id: sprintId,
  [keyField]: id,
  priority,
}))

const insertPriorityRelations = async (
  db: any,
  table: string,
  rows: Record<string, unknown>[]
) => {
  if (rows.length === 0) return
  const { error } = await db.from(table).insert(rows)
  if (error) {
    throw error
  }
}

const respondWithError = (message: string, status = 400) => {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    const sprintId = searchParams.get('id')

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    if (sprintId) {
      const { data: sprint, error: sprintError } = await db
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single()

      if (sprintError || !sprint) {
        return respondWithError('Sprint not found', 404)
      }

      const [segmentsMap, topicsMap, channelsMap] = await Promise.all([
        fetchPriorityRelations(db, 'sprint_segments', 'segment_id', [sprint.id]),
        fetchPriorityRelations(db, 'sprint_topics', 'topic_id', [sprint.id]),
        fetchPriorityRelations(db, 'sprint_channels', 'channel_key', [sprint.id]),
      ])

      return NextResponse.json(buildSprintPayload(sprint, segmentsMap, topicsMap, channelsMap))
    }

    let query = db
      .from('sprints')
      .select('*')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query.order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching sprints:', error)
      return respondWithError('Failed to fetch sprints', 500)
    }

    const sprintIds = (data || []).map((sprint: any) => sprint.id)

    const [segmentsMap, topicsMap, channelsMap] = await Promise.all([
      fetchPriorityRelations(db, 'sprint_segments', 'segment_id', sprintIds),
      fetchPriorityRelations(db, 'sprint_topics', 'topic_id', sprintIds),
      fetchPriorityRelations(db, 'sprint_channels', 'channel_key', sprintIds),
    ])

    const sprintsWithRelations = (data || []).map((sprint: any) =>
      buildSprintPayload(sprint, segmentsMap, topicsMap, channelsMap)
    )

    return NextResponse.json(sprintsWithRelations)
  } catch (error) {
    console.error('GET /api/sprints error:', error)
    return respondWithError('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const body = await request.json()

    const campaignId = body.campaign_id
    const focusStage = body.focus_stage
    const focusGoals = normalizeStringArray(body.focus_goals)

    if (!campaignId) {
      return respondWithError('campaign_id is required')
    }
    if (!focusStage || typeof focusStage !== 'string') {
      return respondWithError('focus_stage is required')
    }

    const focusErrors = []
    focusErrors.push(ensureLengthRange('focus_goals', focusGoals, 1, 3))

    const focusPayload = reduceFocusPayload(body)
    focusErrors.push(ensureLengthRange('focus_segments_primary', focusPayload.focusSegmentsPrimary, 1, 2))
    focusErrors.push(ensureLengthRange('focus_topics_primary', focusPayload.focusTopicsPrimary, 2, 3))
    focusErrors.push(ensureLengthRange('focus_channels_primary', focusPayload.focusChannelsPrimary, 2, 3))
    focusErrors.push(ensureMaxLength('focus_segments_secondary', focusPayload.focusSegmentsSecondary, 2))
    if (focusPayload.focusTopicsSecondary.length > 0) {
      focusErrors.push(
        focusPayload.focusTopicsSecondary.length < 2
          ? 'focus_topics_secondary must contain at least 2 entries when provided'
          : focusPayload.focusTopicsSecondary.length > 4
            ? 'focus_topics_secondary cannot have more than 4 entries'
            : null
      )
    }

    const validationError = focusErrors.find(Boolean)
    if (validationError) {
      return respondWithError(validationError as string)
    }

    const insertData: Record<string, unknown> = {
      campaign_id: campaignId,
      name: body.name,
      start_date: body.start_date,
      end_date: body.end_date,
      focus_stage: focusStage,
      focus_goal: body.focus_goal,
      focus_description: body.focus_description || '',
      focus_goals: focusGoals,
      focus_channels: [
        ...focusPayload.focusChannelsPrimary,
        ...focusPayload.focusChannelsSecondary,
      ],
      order: body.order || 1,
      success_indicators: body.success_indicators || [],
      risks_and_watchouts: body.risks_and_watchouts || [],
      success_criteria: body.success_criteria || [],
      key_messages_summary: body.key_messages_summary || null,
      suggested_weekly_post_volume: body.suggested_weekly_post_volume || null,
      narrative_emphasis: body.narrative_emphasis || [],
      status: body.status || 'planned',
    }

    if (body.id) {
      const { data: existingSprint } = await db
        .from('sprints')
        .select('id')
        .eq('id', body.id)
        .single()

      if (existingSprint) {
        return respondWithError('Sprint already exists. Use PUT to update instead.')
      }

      insertData.id = body.id
    }

    const { data: newSprint, error: insertError } = await db
      .from('sprints')
      .insert(insertData as any)
      .select()
      .single()

    if (insertError || !newSprint) {
      console.error('Failed to insert sprint:', insertError)
      return respondWithError(insertError?.message || 'Failed to insert sprint', 500)
    }

    await insertPriorityRelations(db, 'sprint_segments', [
      ...buildPriorityRows(newSprint.id, focusPayload.focusSegmentsPrimary, 'segment_id', 'primary'),
      ...buildPriorityRows(newSprint.id, focusPayload.focusSegmentsSecondary, 'segment_id', 'secondary'),
    ])
    await insertPriorityRelations(db, 'sprint_topics', [
      ...buildPriorityRows(newSprint.id, focusPayload.focusTopicsPrimary, 'topic_id', 'primary'),
      ...buildPriorityRows(newSprint.id, focusPayload.focusTopicsSecondary, 'topic_id', 'secondary'),
    ])
    await insertPriorityRelations(db, 'sprint_channels', [
      ...buildPriorityRows(newSprint.id, focusPayload.focusChannelsPrimary, 'channel_key', 'primary'),
      ...buildPriorityRows(newSprint.id, focusPayload.focusChannelsSecondary, 'channel_key', 'secondary'),
    ])

    const [segmentsMap, topicsMap, channelsMap] = await Promise.all([
      fetchPriorityRelations(db, 'sprint_segments', 'segment_id', [newSprint.id]),
      fetchPriorityRelations(db, 'sprint_topics', 'topic_id', [newSprint.id]),
      fetchPriorityRelations(db, 'sprint_channels', 'channel_key', [newSprint.id]),
    ])

    return NextResponse.json(buildSprintPayload(newSprint, segmentsMap, topicsMap, channelsMap))
  } catch (error) {
    console.error('POST /api/sprints error:', error)
    return respondWithError('Internal Server Error', 500)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const body: Record<string, unknown> = await request.json()

    const sprintId = body.id as string | undefined
    if (!sprintId) {
      return respondWithError('Sprint ID required')
    }

    if (body.start_date && body.end_date) {
      if (new Date(body.end_date as string) < new Date(body.start_date as string)) {
        return respondWithError('End date cannot be before start date')
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.name === 'string') updateData.name = body.name
    if (typeof body.start_date === 'string') updateData.start_date = body.start_date
    if (typeof body.end_date === 'string') updateData.end_date = body.end_date
    if (typeof body.focus_stage === 'string') updateData.focus_stage = body.focus_stage
    if (typeof body.focus_goal === 'string') updateData.focus_goal = body.focus_goal
    if (typeof body.focus_description === 'string') updateData.focus_description = body.focus_description
    if (body.focus_goals !== undefined) {
      const focusGoals = normalizeStringArray(body.focus_goals)
      const errorMessage = ensureLengthRange('focus_goals', focusGoals, 1, 3)
      if (errorMessage) {
        return respondWithError(errorMessage)
      }
      updateData.focus_goals = focusGoals
    }
    if (body.focus_goals === undefined) {
      // leave existing
    }
    if (body.order !== undefined) updateData.order = body.order
    if (body.success_indicators !== undefined) updateData.success_indicators = body.success_indicators
    if (body.risks_and_watchouts !== undefined) updateData.risks_and_watchouts = body.risks_and_watchouts
    if (body.success_criteria !== undefined) updateData.success_criteria = body.success_criteria
    if (body.key_messages_summary !== undefined) updateData.key_messages_summary = body.key_messages_summary
    if (body.suggested_weekly_post_volume !== undefined) updateData.suggested_weekly_post_volume = body.suggested_weekly_post_volume
    if (body.narrative_emphasis !== undefined) updateData.narrative_emphasis = body.narrative_emphasis
    if (body.status !== undefined) updateData.status = body.status

    const { data: updatedSprint, error: updateError } = await db
      .from('sprints')
      .update(updateData)
      .eq('id', sprintId)
      .select()
      .single()

    if (updateError || !updatedSprint) {
      console.error('Failed to update sprint:', updateError)
      return respondWithError(updateError?.message || 'Failed to update sprint', 500)
    }

    const shouldUpdateSegments = body.focus_segments_primary !== undefined || body.focus_segments !== undefined || body.focus_segments_secondary !== undefined
    const shouldUpdateTopics = body.focus_topics_primary !== undefined || body.focus_topics !== undefined || body.focus_topics_secondary !== undefined
    const shouldUpdateChannels = body.focus_channels_primary !== undefined || body.focus_channels !== undefined || body.focus_channels_secondary !== undefined

    const focusPayload = reduceFocusPayload(body)

    if (shouldUpdateSegments) {
      const segmentPrimaryError = ensureLengthRange('focus_segments_primary', focusPayload.focusSegmentsPrimary, 1, 2)
      const segmentSecondaryError = ensureMaxLength('focus_segments_secondary', focusPayload.focusSegmentsSecondary, 2)
      const segmentValidationError = segmentPrimaryError || segmentSecondaryError
      if (segmentValidationError) {
        return respondWithError(segmentValidationError)
      }

      await db.from('sprint_segments').delete().eq('sprint_id', sprintId)
      const segmentRows = [
        ...buildPriorityRows(sprintId, focusPayload.focusSegmentsPrimary, 'segment_id', 'primary'),
        ...buildPriorityRows(sprintId, focusPayload.focusSegmentsSecondary, 'segment_id', 'secondary'),
      ]
      await insertPriorityRelations(db, 'sprint_segments', segmentRows)
    }
    if (shouldUpdateTopics) {
      const topicPrimaryError = ensureLengthRange('focus_topics_primary', focusPayload.focusTopicsPrimary, 2, 3)
      let topicSecondaryError: string | null = null
      if (focusPayload.focusTopicsSecondary.length > 0) {
        if (focusPayload.focusTopicsSecondary.length < 2) {
          topicSecondaryError = 'focus_topics_secondary must contain at least 2 entries when provided'
        } else if (focusPayload.focusTopicsSecondary.length > 4) {
          topicSecondaryError = 'focus_topics_secondary cannot have more than 4 entries'
        }
      }
      const topicValidationError = topicPrimaryError || topicSecondaryError
      if (topicValidationError) {
        return respondWithError(topicValidationError)
      }

      await db.from('sprint_topics').delete().eq('sprint_id', sprintId)
      const topicRows = [
        ...buildPriorityRows(sprintId, focusPayload.focusTopicsPrimary, 'topic_id', 'primary'),
        ...buildPriorityRows(sprintId, focusPayload.focusTopicsSecondary, 'topic_id', 'secondary'),
      ]
      await insertPriorityRelations(db, 'sprint_topics', topicRows)
    }
    if (shouldUpdateChannels) {
      const channelPrimaryError = ensureLengthRange('focus_channels_primary', focusPayload.focusChannelsPrimary, 2, 3)
      if (channelPrimaryError) {
        return respondWithError(channelPrimaryError)
      }

      updateData.focus_channels = [
        ...focusPayload.focusChannelsPrimary,
        ...focusPayload.focusChannelsSecondary,
      ]

      await db.from('sprint_channels').delete().eq('sprint_id', sprintId)
      const channelRows = [
        ...buildPriorityRows(sprintId, focusPayload.focusChannelsPrimary, 'channel_key', 'primary'),
        ...buildPriorityRows(sprintId, focusPayload.focusChannelsSecondary, 'channel_key', 'secondary'),
      ]
      await insertPriorityRelations(db, 'sprint_channels', channelRows)
    }

    const [segmentsMap, topicsMap, channelsMap] = await Promise.all([
      fetchPriorityRelations(db, 'sprint_segments', 'segment_id', [sprintId]),
      fetchPriorityRelations(db, 'sprint_topics', 'topic_id', [sprintId]),
      fetchPriorityRelations(db, 'sprint_channels', 'channel_key', [sprintId]),
    ])

    return NextResponse.json(buildSprintPayload(updatedSprint, segmentsMap, topicsMap, channelsMap))
  } catch (error) {
    console.error('PUT /api/sprints error:', error)
    return respondWithError('Internal Server Error', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return respondWithError('Sprint ID required')
    }

    const { error } = await db.from('sprints').delete().eq('id', id)

    if (error) {
      return respondWithError(error.message, 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/sprints error:', error)
    return respondWithError('Internal Server Error', 500)
  }
}
