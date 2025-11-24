import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExecutionPlanSchema, ExecutionPlan } from '@/lib/ai/schemas'
import { Database } from '@/lib/supabase/types'

type SprintInsert = Database['campaign_os']['Tables']['sprints']['Insert']
type ContentSlotInsert = Database['campaign_os']['Tables']['content_slots']['Insert']
type SprintSegmentInsert = Database['campaign_os']['Tables']['sprint_segments']['Insert']
type SprintTopicInsert = Database['campaign_os']['Tables']['sprint_topics']['Insert']
type SprintChannelInsert = Database['campaign_os']['Tables']['sprint_channels']['Insert']

interface SaveExecutionPlanRequest {
  campaignId: string
  executionPlan: ExecutionPlan
}

interface SaveExecutionPlanResponse {
  success: boolean
  sprints: Array<{ id: string; name: string }>
  contentSlots: number
  message?: string
}

/**
 * Validates that all content slot dates are within their sprint date ranges
 */
function validateSlotDates(executionPlan: ExecutionPlan): { valid: boolean; error?: string } {
  const sprintMap = new Map(executionPlan.sprints.map(s => [s.id, s]))
  
  for (const slot of executionPlan.content_calendar) {
    const sprint = sprintMap.get(slot.sprint_id)
    if (!sprint) {
      return {
        valid: false,
        error: `Content slot ${slot.id} references non-existent sprint ${slot.sprint_id}`
      }
    }
    
    const slotDate = new Date(slot.date)
    const sprintStart = new Date(sprint.start_date)
    const sprintEnd = new Date(sprint.end_date)
    
    if (slotDate < sprintStart || slotDate > sprintEnd) {
      return {
        valid: false,
        error: `Content slot date ${slot.date} is outside sprint date range ${sprint.start_date} to ${sprint.end_date} for sprint "${sprint.name}"`
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validates that there are no duplicate slot_index values for the same (date, channel) combination
 */
function validateSlotIndices(executionPlan: ExecutionPlan): { valid: boolean; error?: string } {
  const slotMap = new Map<string, Set<number>>()
  
  for (const slot of executionPlan.content_calendar) {
    const key = `${slot.date}:${slot.channel}`
    if (!slotMap.has(key)) {
      slotMap.set(key, new Set())
    }
    
    const indices = slotMap.get(key)!
    if (indices.has(slot.slot_index)) {
      return {
        valid: false,
        error: `Duplicate slot_index ${slot.slot_index} for date ${slot.date} and channel ${slot.channel}`
      }
    }
    
    indices.add(slot.slot_index)
  }
  
  return { valid: true }
}

/**
 * Checks if an execution plan already exists for the campaign
 */
async function checkExistingPlan(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  campaignId: string
): Promise<{ exists: boolean; sprintIds?: string[] }> {
  const db = supabase.schema('campaign_os')
  
  const { data: sprints, error } = await db
    .from('sprints')
    .select('id')
    .eq('campaign_id', campaignId)
  
  if (error) {
    throw new Error(`Failed to check existing plan: ${error.message}`)
  }
  
  return {
    exists: (sprints?.length ?? 0) > 0,
    sprintIds: sprints?.map(s => s.id)
  }
}

/**
 * Deletes existing execution plan for a campaign (used for update scenario)
 */
async function deleteExistingPlan(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  campaignId: string
): Promise<void> {
  const db = supabase.schema('campaign_os')
  
  // Get all sprint IDs for this campaign
  const { data: sprints, error: fetchError } = await db
    .from('sprints')
    .select('id')
    .eq('campaign_id', campaignId)
  
  if (fetchError) {
    throw new Error(`Failed to fetch existing sprints: ${fetchError.message}`)
  }
  
  if (!sprints || sprints.length === 0) {
    return // Nothing to delete
  }
  
  const sprintIds = sprints.map(s => s.id)
  
  // Delete in order: content_slots, junction tables, then sprints
  // CASCADE should handle most of this, but we'll be explicit
  
  // Delete content slots
  const { error: slotsError } = await db
    .from('content_slots')
    .delete()
    .in('sprint_id', sprintIds)
  
  if (slotsError) {
    throw new Error(`Failed to delete content slots: ${slotsError.message}`)
  }
  
  // Delete junction tables
  const { error: segmentsError } = await db
    .from('sprint_segments')
    .delete()
    .in('sprint_id', sprintIds)
  
  if (segmentsError) {
    throw new Error(`Failed to delete sprint_segments: ${segmentsError.message}`)
  }
  
  const { error: topicsError } = await db
    .from('sprint_topics')
    .delete()
    .in('sprint_id', sprintIds)
  
  if (topicsError) {
    throw new Error(`Failed to delete sprint_topics: ${topicsError.message}`)
  }
  
  const { error: channelsError } = await db
    .from('sprint_channels')
    .delete()
    .in('sprint_id', sprintIds)
  
  if (channelsError) {
    throw new Error(`Failed to delete sprint_channels: ${channelsError.message}`)
  }
  
  // Delete sprints (CASCADE should handle related records, but we've already deleted them)
  const { error: sprintsError } = await db
    .from('sprints')
    .delete()
    .eq('campaign_id', campaignId)
  
  if (sprintsError) {
    throw new Error(`Failed to delete sprints: ${sprintsError.message}`)
  }
}

/**
 * Saves execution plan to database using Supabase batch operations
 * Note: Supabase JS client doesn't support true transactions, so we use batch inserts
 * and manual rollback on error. For true atomicity, consider using PostgreSQL functions.
 */
async function saveExecutionPlan(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  campaignId: string,
  executionPlan: ExecutionPlan
): Promise<SaveExecutionPlanResponse> {
  const db = supabase.schema('campaign_os')
  const savedSprintIds: string[] = []
  const savedContentSlotIds: string[] = []
  
  try {
    // Step 1: Insert sprints
    const sprintInserts: SprintInsert[] = executionPlan.sprints.map(sprint => ({
      campaign_id: campaignId,
      name: sprint.name,
      order: sprint.order,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      focus_goal: sprint.focus_goal || 'awareness', // Default to awareness if undefined
      focus_description: sprint.focus_description || '', // Default to empty string if undefined
      focus_channels: sprint.focus_channels as any, // JSONB
      success_indicators: sprint.success_indicators as any, // JSONB
      status: 'planned' as const,
      // Enhanced fields (Phase 2) - all optional
      focus_stage: sprint.focus_stage,
      focus_goals: sprint.focus_goals as any, // JSONB array
      suggested_weekly_post_volume: sprint.suggested_weekly_post_volume as any, // JSONB object
      narrative_emphasis: sprint.narrative_emphasis as any, // JSONB array
      key_messages_summary: sprint.key_messages_summary,
      success_criteria: sprint.success_criteria as any, // JSONB array
      risks_and_watchouts: sprint.risks_and_watchouts as any, // JSONB array
    }))
    
    const { data: insertedSprints, error: sprintsError } = await db
      .from('sprints')
      .insert(sprintInserts)
      .select('id, name')
    
    if (sprintsError) {
      throw new Error(`Failed to insert sprints: ${sprintsError.message}`)
    }
    
    if (!insertedSprints || insertedSprints.length !== executionPlan.sprints.length) {
      throw new Error('Failed to insert all sprints')
    }
    
    // Map original sprint IDs to new database IDs
    const sprintIdMap = new Map<string, string>()
    executionPlan.sprints.forEach((sprint, index) => {
      sprintIdMap.set(sprint.id, insertedSprints[index].id)
      savedSprintIds.push(insertedSprints[index].id)
    })
    
    // Step 2: Insert junction tables (batch inserts)
    const segmentInserts: SprintSegmentInsert[] = []
    const topicInserts: SprintTopicInsert[] = []
    const channelInserts: SprintChannelInsert[] = []
    
    executionPlan.sprints.forEach(sprint => {
      const dbSprintId = sprintIdMap.get(sprint.id)!
      
      // Sprint-segment relationships
      sprint.focus_segments.forEach(segmentId => {
        segmentInserts.push({
          sprint_id: dbSprintId,
          segment_id: segmentId,
        })
      })
      
      // Sprint-topic relationships
      sprint.focus_topics.forEach(topicId => {
        topicInserts.push({
          sprint_id: dbSprintId,
          topic_id: topicId,
        })
      })
      
      // Sprint-channel relationships
      sprint.focus_channels.forEach(channelKey => {
        channelInserts.push({
          sprint_id: dbSprintId,
          channel_key: channelKey,
        })
      })
    })
    
    // Insert junction tables
    if (segmentInserts.length > 0) {
      const { error: segmentsError } = await db
        .from('sprint_segments')
        .insert(segmentInserts)
      
      if (segmentsError) {
        throw new Error(`Failed to insert sprint_segments: ${segmentsError.message}`)
      }
    }
    
    if (topicInserts.length > 0) {
      const { error: topicsError } = await db
        .from('sprint_topics')
        .insert(topicInserts)
      
      if (topicsError) {
        throw new Error(`Failed to insert sprint_topics: ${topicsError.message}`)
      }
    }
    
    if (channelInserts.length > 0) {
      const { error: channelsError } = await db
        .from('sprint_channels')
        .insert(channelInserts)
      
      if (channelsError) {
        throw new Error(`Failed to insert sprint_channels: ${channelsError.message}`)
      }
    }
    
    // Step 3: Insert content slots
    const slotInserts: ContentSlotInsert[] = executionPlan.content_calendar.map(slot => ({
      sprint_id: sprintIdMap.get(slot.sprint_id)!,
      date: slot.date,
      channel: slot.channel,
      slot_index: slot.slot_index,
      primary_segment_id: slot.primary_segment_id || null,
      primary_topic_id: slot.primary_topic_id || null,
      objective: slot.objective,
      content_type: slot.content_type,
      angle_hint: slot.angle_hint || null,
      notes: slot.notes || null,
      status: slot.status || 'planned',
    }))
    
    const { data: insertedSlots, error: slotsError } = await db
      .from('content_slots')
      .insert(slotInserts)
      .select('id')
    
    if (slotsError) {
      throw new Error(`Failed to insert content slots: ${slotsError.message}`)
    }
    
    if (!insertedSlots || insertedSlots.length !== executionPlan.content_calendar.length) {
      throw new Error('Failed to insert all content slots')
    }
    
    savedContentSlotIds.push(...insertedSlots.map(s => s.id))
    
    return {
      success: true,
      sprints: insertedSprints.map(s => ({ id: s.id, name: s.name })),
      contentSlots: insertedSlots.length,
    }
  } catch (error) {
    // Rollback: Delete any saved data
    // Note: In a true transaction, this would be automatic, but Supabase JS client
    // doesn't support transactions, so we manually clean up
    
    if (savedSprintIds.length > 0) {
      // Delete in reverse order: content_slots, junction tables, sprints
      const db = supabase.schema('campaign_os')
      
      // Safely delete (ignore errors during rollback)
      try {
        await db.from('content_slots').delete().in('sprint_id', savedSprintIds)
      } catch {
        // Ignore errors during rollback
      }
      try {
        await db.from('sprint_segments').delete().in('sprint_id', savedSprintIds)
      } catch {
        // Ignore errors during rollback
      }
      try {
        await db.from('sprint_topics').delete().in('sprint_id', savedSprintIds)
      } catch {
        // Ignore errors during rollback
      }
      try {
        await db.from('sprint_channels').delete().in('sprint_id', savedSprintIds)
      } catch {
        // Ignore errors during rollback
      }
      try {
        await db.from('sprints').delete().in('id', savedSprintIds)
      } catch {
        // Ignore errors during rollback
      }
    }
    
    throw error
  }
}

/**
 * Loads execution plan from database for a campaign
 */
async function loadExecutionPlan(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  campaignId: string
): Promise<ExecutionPlan | null> {
  const db = supabase.schema('campaign_os')
  
  // Load sprints
  const { data: sprints, error: sprintsError } = await db
    .from('sprints')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('order', { ascending: true })
  
  if (sprintsError) {
    throw new Error(`Failed to load sprints: ${sprintsError.message}`)
  }
  
  if (!sprints || sprints.length === 0) {
    return null // No execution plan exists yet
  }
  
  const sprintIds = sprints.map(s => s.id)
  
  // Load junction tables
  const { data: sprintSegments, error: segmentsError } = await db
    .from('sprint_segments')
    .select('sprint_id, segment_id')
    .in('sprint_id', sprintIds)
  
  if (segmentsError) {
    throw new Error(`Failed to load sprint_segments: ${segmentsError.message}`)
  }
  
  const { data: sprintTopics, error: topicsError } = await db
    .from('sprint_topics')
    .select('sprint_id, topic_id')
    .in('sprint_id', sprintIds)
  
  if (topicsError) {
    throw new Error(`Failed to load sprint_topics: ${topicsError.message}`)
  }
  
  const { data: sprintChannels, error: channelsError } = await db
    .from('sprint_channels')
    .select('sprint_id, channel_key')
    .in('sprint_id', sprintIds)
  
  if (channelsError) {
    throw new Error(`Failed to load sprint_channels: ${channelsError.message}`)
  }
  
  // Load content slots
  const { data: contentSlots, error: slotsError } = await db
    .from('content_slots')
    .select('*')
    .in('sprint_id', sprintIds)
    .order('date', { ascending: true })
    .order('slot_index', { ascending: true })
  
  if (slotsError) {
    throw new Error(`Failed to load content_slots: ${slotsError.message}`)
  }
  
  // Build sprint map for segments/topics/channels
  const segmentMap = new Map<string, string[]>()
  const topicMap = new Map<string, string[]>()
  const channelMap = new Map<string, string[]>()
  
  sprintSegments?.forEach(ss => {
    if (!segmentMap.has(ss.sprint_id)) {
      segmentMap.set(ss.sprint_id, [])
    }
    segmentMap.get(ss.sprint_id)!.push(ss.segment_id)
  })
  
  sprintTopics?.forEach(st => {
    if (!topicMap.has(st.sprint_id)) {
      topicMap.set(st.sprint_id, [])
    }
    topicMap.get(st.sprint_id)!.push(st.topic_id)
  })
  
  sprintChannels?.forEach(sc => {
    if (!channelMap.has(sc.sprint_id)) {
      channelMap.set(sc.sprint_id, [])
    }
    channelMap.get(sc.sprint_id)!.push(sc.channel_key)
  })
  
  // Transform to ExecutionPlan format
  const executionPlan: ExecutionPlan = {
    sprints: sprints.map(sprint => {
      // Normalize success_indicators to array
      let successIndicators: any[] = []
      if (sprint.success_indicators) {
        if (Array.isArray(sprint.success_indicators)) {
          successIndicators = sprint.success_indicators
        } else {
          // If it's not an array, wrap it
          successIndicators = [sprint.success_indicators]
        }
      }
      
      return {
        id: sprint.id,
        name: sprint.name,
        order: sprint.order || 1,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        focus_goal: sprint.focus_goal as any,
        focus_description: sprint.focus_description || '',
        focus_segments: segmentMap.get(sprint.id) || [],
        focus_topics: topicMap.get(sprint.id) || [],
        focus_channels: channelMap.get(sprint.id) || (sprint.focus_channels as string[] || []),
        success_indicators: successIndicators,
      }
    }),
    content_calendar: (contentSlots || []).map(slot => ({
      id: slot.id,
      sprint_id: slot.sprint_id,
      date: slot.date,
      channel: slot.channel,
      slot_index: slot.slot_index,
      primary_segment_id: slot.primary_segment_id || undefined,
      primary_topic_id: slot.primary_topic_id || undefined,
      objective: slot.objective as any,
      content_type: slot.content_type as any,
      angle_hint: slot.angle_hint || undefined,
      notes: slot.notes || undefined,
      status: (slot.status || 'planned') as any,
    })),
  }
  
  return executionPlan
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign_id')
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaign_id query parameter is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const executionPlan = await loadExecutionPlan(supabase, campaignId)
    
    if (!executionPlan) {
      return NextResponse.json(null, { status: 200 })
    }
    
    return NextResponse.json(executionPlan)
  } catch (error) {
    console.error('Error loading execution plan:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveExecutionPlanRequest = await request.json()
    
    // Validate request body
    if (!body.campaignId || !body.executionPlan) {
      return NextResponse.json(
        { error: 'campaignId and executionPlan are required' },
        { status: 400 }
      )
    }
    
    // Validate execution plan against schema
    const validationResult = ExecutionPlanSchema.safeParse(body.executionPlan)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid execution plan',
          details: validationResult.error.issues.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }
    
    const executionPlan = validationResult.data
    
    // Validate slot dates are within sprint ranges
    const dateValidation = validateSlotDates(executionPlan)
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      )
    }
    
    // Validate no duplicate slot_index per (date, channel)
    const indexValidation = validateSlotIndices(executionPlan)
    if (!indexValidation.valid) {
      return NextResponse.json(
        { error: indexValidation.error },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Check for existing plan (AC 5.4.4: Duplicate save handling)
    const existingPlan = await checkExistingPlan(supabase, body.campaignId)
    
    if (existingPlan.exists) {
      // Option A: Update existing plan (delete old, insert new)
      await deleteExistingPlan(supabase, body.campaignId)
    }
    
    // Save execution plan
    const result = await saveExecutionPlan(supabase, body.campaignId, executionPlan)
    
    return NextResponse.json({
      ...result,
      message: existingPlan.exists
        ? 'Execution plan updated successfully'
        : 'Execution plan saved successfully',
    })
  } catch (error) {
    console.error('Error saving execution plan:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

