/**
 * @jest-environment node
 */

import { POST } from '@/app/api/ai/campaign-sprints/[sprintId]/content-slots/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/ai/client', () => ({
  getAIProvider: () => ({
    generateText: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        content_slots: [
          {
            id: 'slot-1',
            sprint_id: 'test-sprint-1',
            date: '2024-01-02',
            channel: 'facebook',
            slot_index: 1,
            primary_segment_id: '11111111-1111-1111-1111-111111111111',
            primary_topic_id: '22222222-2222-2222-2222-222222222222',
            objective: 'reach',
            content_type: 'static_image',
            angle_hint: 'Test angle',
            notes: 'Test notes',
            status: 'planned',
          },
        ],
      }),
    }),
  }),
}))

jest.mock('@/lib/ai/execution-planner', () => ({
  enforceConstraints: jest.fn().mockReturnValue({
    plan: {
      content_calendar: [
        {
          id: 'slot-1',
          sprint_id: 'test-sprint-1',
          date: '2024-01-02',
          channel: 'facebook',
          slot_index: 1,
          primary_segment_id: '11111111-1111-1111-1111-111111111111',
          primary_topic_id: '22222222-2222-2222-2222-222222222222',
          objective: 'reach',
          content_type: 'static_image',
          angle_hint: 'Test angle',
          notes: 'Test notes',
          status: 'planned',
        },
      ],
    },
    warnings: [],
  }),
}))

const mockSprintData = {
  data: {
    id: 'test-sprint-1',
    campaign_id: 'test-campaign-1',
    name: 'Sprint 1',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    focus_stage: 'awareness',
    key_messages_summary: 'Test messages',
    suggested_weekly_post_volume: {
      total_posts_per_week: 5,
      video_posts_per_week: 1,
    },
  },
  error: null,
}

const mockCampaignData = {
  data: {
    id: 'test-campaign-1',
    name: 'Test Campaign',
    campaign_type: 'political_issue',
    primary_goal_type: 'awareness',
    goals: [],
    segments: [{ id: '11111111-1111-1111-1111-111111111111', name: 'Test Segment' }],
    topics: [{ id: '22222222-2222-2222-2222-222222222222', name: 'Test Topic' }],
    narratives: [],
    narrative_list: [],
  },
  error: null,
}

const mockFocusSegmentsData = {
  data: [{ segment_id: '11111111-1111-1111-1111-111111111111' }],
  error: null,
}

const mockFocusTopicsData = {
  data: [{ topic_id: '22222222-2222-2222-2222-222222222222' }],
  error: null,
}

const mockFocusChannelsData = {
  data: [{ channel: 'facebook' }],
  error: null,
}

// Mock database chain
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    schema: () => ({
      from: mockFrom,
    }),
  }),
}))

describe('/api/ai/campaign-sprints/[sprintId]/content-slots', () => {
  beforeEach(() => {
    process.env.AI_MODEL = 'gpt-4o'
    jest.clearAllMocks()

    // Setup default mock chain
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    
    // Default mock implementations
    mockSingle.mockImplementation(() => {
      // Determine which data to return based on the table being queried
      // This is a bit tricky with the chain, so we might need to be more specific in the tests
      return Promise.resolve(mockSprintData) // Default fallback
    })
  })

  it('should generate content slots for valid sprint', async () => {
    // Setup specific mocks for this test
    mockFrom.mockImplementation((table) => {
      if (table === 'sprints') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockSprintData)
            })
          })
        }
      }
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockCampaignData)
            })
          })
        }
      }
      if (table === 'sprint_segments') {
        return {
          select: () => ({
            eq: () => Promise.resolve(mockFocusSegmentsData)
          })
        }
      }
      if (table === 'sprint_topics') {
        return {
          select: () => ({
            eq: () => Promise.resolve(mockFocusTopicsData)
          })
        }
      }
      if (table === 'sprint_channels') {
        return {
          select: () => ({
            eq: () => Promise.resolve(mockFocusChannelsData)
          })
        }
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }
    })

    const request = new NextRequest('http://localhost/api/ai/campaign-sprints/test-sprint-1/content-slots', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request, { params: Promise.resolve({ sprintId: 'test-sprint-1' }) })
    expect(response.ok).toBe(true)
    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
  })

  it('should return 404 when sprint not found', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'sprints') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Not found' } })
            })
          })
        }
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }
    })

    const request = new NextRequest('http://localhost/api/ai/campaign-sprints/non-existent/content-slots', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request, { params: Promise.resolve({ sprintId: 'non-existent' }) })
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Sprint not found')
  })

  it('should accept weekly_post_volume override', async () => {
     // Setup specific mocks for this test (same as success case)
     mockFrom.mockImplementation((table) => {
      if (table === 'sprints') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockSprintData)
            })
          })
        }
      }
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockCampaignData)
            })
          })
        }
      }
      if (table === 'sprint_segments') {
        return {
          select: () => ({
            eq: () => Promise.resolve(mockFocusSegmentsData)
          })
        }
      }
      if (table === 'sprint_topics') {
        return {
          select: () => ({
            eq: () => Promise.resolve(mockFocusTopicsData)
          })
        }
      }
      if (table === 'sprint_focus_channels') {
        return {
          select: () => ({
            eq: () => Promise.resolve(mockFocusChannelsData)
          })
        }
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }
    })

    const request = new NextRequest('http://localhost/api/ai/campaign-sprints/test-sprint-1/content-slots', {
      method: 'POST',
      body: JSON.stringify({
        weekly_post_volume: {
          total_posts_per_week: 10,
          video_posts_per_week: 2,
        }
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request, { params: Promise.resolve({ sprintId: 'test-sprint-1' }) })
    expect(response.ok).toBe(true)
  })
})
