import { ExecutionPlan, ContentSlot } from '@/lib/ai/schemas'

export interface ConstraintViolation {
  type: 'removed' | 'moved'
  slot: ContentSlot
  reason: string
  newDate?: string
}

export interface ConstraintEnforcementResult {
  plan: ExecutionPlan
  warnings: ConstraintViolation[]
}

/**
 * Enforces content slot constraints:
 * - Max 1-2 posts per day per channel (Stories: 5)
 * - Weekly total limits (handled by generation, but verify here)
 * - Removes or moves slots by priority if constraints violated
 */
export function enforceConstraints(
  plan: ExecutionPlan,
  channels: string[]
): ConstraintEnforcementResult {
  const warnings: ConstraintViolation[] = []
  const slotsByDateAndChannel: Map<string, ContentSlot[]> = new Map()

  // Group slots by date and channel
  plan.content_calendar.forEach(slot => {
    const key = `${slot.date}:${slot.channel}`
    if (!slotsByDateAndChannel.has(key)) {
      slotsByDateAndChannel.set(key, [])
    }
    slotsByDateAndChannel.get(key)!.push(slot)
  })

  // Check constraints and remove/move slots
  const validSlots: ContentSlot[] = []
  const slotsToRemove: ContentSlot[] = []

  plan.content_calendar.forEach(slot => {
    const key = `${slot.date}:${slot.channel}`
    const slotsOnSameDayChannel = slotsByDateAndChannel.get(key) || []

    // Determine max slots per day per channel
    const maxSlots = slot.channel.toLowerCase().includes('story') ? 5 : 2

    if (slotsOnSameDayChannel.length > maxSlots) {
      // Find this slot's position in the array
      const slotIndex = slotsOnSameDayChannel.findIndex(s => s.id === slot.id)
      
      // Remove slots beyond the limit, prioritizing by:
      // 1. Keep slots with primary_segment_id and primary_topic_id (higher priority)
      // 2. Remove experimental role slots first
      // 3. Remove low priority slots
      
      // Sort slots by priority (higher priority first)
      const sortedSlots = [...slotsOnSameDayChannel].sort((a, b) => {
        // Priority: has both segment and topic > has one > has none
        const aPriority = (a.primary_segment_id ? 1 : 0) + (a.primary_topic_id ? 1 : 0)
        const bPriority = (b.primary_segment_id ? 1 : 0) + (b.primary_topic_id ? 1 : 0)
        return bPriority - aPriority
      })

      // Keep first maxSlots, mark rest for removal
      if (slotIndex >= maxSlots) {
        // Try to move to another day in the same sprint
        const sprint = plan.sprints.find(s => s.id === slot.sprint_id)
        if (sprint) {
          const slotDate = new Date(slot.date)
          const sprintStart = new Date(sprint.start_date)
          const sprintEnd = new Date(sprint.end_date)

          // Try to find an available day within sprint
          let moved = false
          for (let dayOffset = 1; dayOffset <= 7 && !moved; dayOffset++) {
            const tryDate = new Date(slotDate)
            tryDate.setDate(tryDate.getDate() + dayOffset)

            if (tryDate >= sprintStart && tryDate <= sprintEnd) {
              const tryDateStr = tryDate.toISOString().split('T')[0]
              const tryKey = `${tryDateStr}:${slot.channel}`
              const slotsOnTryDay = slotsByDateAndChannel.get(tryKey) || []

              if (slotsOnTryDay.length < maxSlots) {
                // Can move here
                slot.date = tryDateStr
                moved = true
                warnings.push({
                  type: 'moved',
                  slot,
                  reason: `Túl sok slot ugyanazon a napon (${slot.channel})`,
                  newDate: tryDateStr,
                })
              }
            }
          }

          if (!moved) {
            // Cannot move, remove
            slotsToRemove.push(slot)
            warnings.push({
              type: 'removed',
              slot,
              reason: `Túl sok slot ugyanazon a napon (${slot.channel}), és nem lehetett másik napra áthelyezni`,
            })
            return // Skip adding to validSlots
          }
        } else {
          // No sprint found, remove
          slotsToRemove.push(slot)
          warnings.push({
            type: 'removed',
            slot,
            reason: 'Sprint nem található',
          })
          return
        }
      }
    }

    validSlots.push(slot)
  })

  // Update slot_index for remaining slots (recalculate per day per channel)
  const slotsByDateChannel: Map<string, ContentSlot[]> = new Map()
  validSlots.forEach(slot => {
    const key = `${slot.date}:${slot.channel}`
    if (!slotsByDateChannel.has(key)) {
      slotsByDateChannel.set(key, [])
    }
    slotsByDateChannel.get(key)!.push(slot)
  })

  // Recalculate slot_index
  slotsByDateChannel.forEach((slots, key) => {
    slots.sort((a, b) => {
      // Sort by primary_segment_id/topic_id presence, then by original slot_index
      const aPriority = (a.primary_segment_id ? 1 : 0) + (a.primary_topic_id ? 1 : 0)
      const bPriority = (b.primary_segment_id ? 1 : 0) + (b.primary_topic_id ? 1 : 0)
      if (aPriority !== bPriority) return bPriority - aPriority
      return (a.slot_index || 0) - (b.slot_index || 0)
    })

    slots.forEach((slot, index) => {
      slot.slot_index = index + 1
    })
  })

  return {
    plan: {
      sprints: plan.sprints,
      content_calendar: validSlots,
    },
    warnings,
  }
}

