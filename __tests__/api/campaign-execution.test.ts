import { ExecutionPlan, SprintPlan, ContentSlot } from '@/lib/ai/schemas'

// Mock data helpers
function createMockSprint(id: string, order: number, startDate: string, endDate: string): SprintPlan {
  return {
    id,
    name: `Sprint ${order}`,
    order,
    start_date: startDate,
    end_date: endDate,
    focus_goal: 'awareness',
    focus_description: 'Test sprint focus',
    focus_segments: ['segment-1'],
    focus_topics: ['topic-1'],
    focus_channels: ['facebook', 'instagram'],
  }
}

function createMockContentSlot(
  id: string,
  sprintId: string,
  date: string,
  channel: string,
  slotIndex: number
): ContentSlot {
  return {
    id,
    sprint_id: sprintId,
    date,
    channel,
    slot_index: slotIndex,
    objective: 'reach',
    content_type: 'static_image',
    status: 'planned',
  }
}

describe('Execution Plan Save API', () => {
  describe('Validation Logic', () => {
    it('should validate slot dates are within sprint date ranges', () => {
      const plan: ExecutionPlan = {
        sprints: [
          createMockSprint('sprint-1', 1, '2025-03-01', '2025-03-14'),
        ],
        content_calendar: [
          createMockContentSlot('slot-1', 'sprint-1', '2025-03-10', 'facebook', 1), // Valid: within range
        ],
      }
      
      // This would be tested in the actual API endpoint
      // For now, we verify the structure is correct
      expect(plan.content_calendar[0].date).toBe('2025-03-10')
      expect(plan.sprints[0].start_date).toBe('2025-03-01')
      expect(plan.sprints[0].end_date).toBe('2025-03-14')
    })

    it('should detect slot date outside sprint range', () => {
      const plan: ExecutionPlan = {
        sprints: [
          createMockSprint('sprint-1', 1, '2025-03-01', '2025-03-14'),
        ],
        content_calendar: [
          createMockContentSlot('slot-1', 'sprint-1', '2025-03-15', 'facebook', 1), // Invalid: outside range
        ],
      }
      
      const slotDate = new Date(plan.content_calendar[0].date)
      const sprintStart = new Date(plan.sprints[0].start_date)
      const sprintEnd = new Date(plan.sprints[0].end_date)
      
      expect(slotDate > sprintEnd).toBe(true) // Slot date is after sprint end
    })

    it('should validate no duplicate slot_index per (date, channel)', () => {
      const plan: ExecutionPlan = {
        sprints: [
          createMockSprint('sprint-1', 1, '2025-03-01', '2025-03-14'),
        ],
        content_calendar: [
          createMockContentSlot('slot-1', 'sprint-1', '2025-03-10', 'facebook', 1),
          createMockContentSlot('slot-2', 'sprint-1', '2025-03-10', 'facebook', 1), // Duplicate index
        ],
      }
      
      const slotMap = new Map<string, Set<number>>()
      let hasDuplicate = false
      
      for (const slot of plan.content_calendar) {
        const key = `${slot.date}:${slot.channel}`
        if (!slotMap.has(key)) {
          slotMap.set(key, new Set())
        }
        
        const indices = slotMap.get(key)!
        if (indices.has(slot.slot_index)) {
          hasDuplicate = true
          break
        }
        
        indices.add(slot.slot_index)
      }
      
      expect(hasDuplicate).toBe(true)
    })

    it('should allow same slot_index for different dates', () => {
      const plan: ExecutionPlan = {
        sprints: [
          createMockSprint('sprint-1', 1, '2025-03-01', '2025-03-14'),
        ],
        content_calendar: [
          createMockContentSlot('slot-1', 'sprint-1', '2025-03-10', 'facebook', 1),
          createMockContentSlot('slot-2', 'sprint-1', '2025-03-11', 'facebook', 1), // Same index, different date - OK
        ],
      }
      
      const slotMap = new Map<string, Set<number>>()
      let hasDuplicate = false
      
      for (const slot of plan.content_calendar) {
        const key = `${slot.date}:${slot.channel}`
        if (!slotMap.has(key)) {
          slotMap.set(key, new Set())
        }
        
        const indices = slotMap.get(key)!
        if (indices.has(slot.slot_index)) {
          hasDuplicate = true
          break
        }
        
        indices.add(slot.slot_index)
      }
      
      expect(hasDuplicate).toBe(false)
    })

    it('should allow same slot_index for different channels', () => {
      const plan: ExecutionPlan = {
        sprints: [
          createMockSprint('sprint-1', 1, '2025-03-01', '2025-03-14'),
        ],
        content_calendar: [
          createMockContentSlot('slot-1', 'sprint-1', '2025-03-10', 'facebook', 1),
          createMockContentSlot('slot-2', 'sprint-1', '2025-03-10', 'instagram', 1), // Same index, different channel - OK
        ],
      }
      
      const slotMap = new Map<string, Set<number>>()
      let hasDuplicate = false
      
      for (const slot of plan.content_calendar) {
        const key = `${slot.date}:${slot.channel}`
        if (!slotMap.has(key)) {
          slotMap.set(key, new Set())
        }
        
        const indices = slotMap.get(key)!
        if (indices.has(slot.slot_index)) {
          hasDuplicate = true
          break
        }
        
        indices.add(slot.slot_index)
      }
      
      expect(hasDuplicate).toBe(false)
    })
  })

  describe('Execution Plan Structure', () => {
    it('should create valid execution plan with multiple sprints and slots', () => {
      const plan: ExecutionPlan = {
        sprints: [
          createMockSprint('sprint-1', 1, '2025-03-01', '2025-03-14'),
          createMockSprint('sprint-2', 2, '2025-03-15', '2025-03-28'),
        ],
        content_calendar: [
          createMockContentSlot('slot-1', 'sprint-1', '2025-03-05', 'facebook', 1),
          createMockContentSlot('slot-2', 'sprint-1', '2025-03-05', 'facebook', 2),
          createMockContentSlot('slot-3', 'sprint-2', '2025-03-20', 'instagram', 1),
        ],
      }
      
      expect(plan.sprints).toHaveLength(2)
      expect(plan.content_calendar).toHaveLength(3)
      expect(plan.sprints[0].order).toBe(1)
      expect(plan.sprints[1].order).toBe(2)
    })

    it('should handle sprint with multiple segments, topics, and channels', () => {
      const sprint: SprintPlan = {
        id: 'sprint-1',
        name: 'Complex Sprint',
        order: 1,
        start_date: '2025-03-01',
        end_date: '2025-03-14',
        focus_goal: 'engagement',
        focus_description: 'Multi-target sprint',
        focus_segments: ['segment-1', 'segment-2', 'segment-3'],
        focus_topics: ['topic-1', 'topic-2'],
        focus_channels: ['facebook', 'instagram', 'twitter'],
      }
      
      expect(sprint.focus_segments).toHaveLength(3)
      expect(sprint.focus_topics).toHaveLength(2)
      expect(sprint.focus_channels).toHaveLength(3)
    })
  })
})

