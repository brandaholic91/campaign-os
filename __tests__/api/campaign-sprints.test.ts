/**
 * @jest-environment node
 */

import { POST } from '@/app/api/ai/campaign-sprints/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/ai/client', () => ({
  getAIProvider: () => ({
    generateText: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        sprints: [
          {
            id: 'test-sprint-1',
            name: 'Sprint 1: Ismertségnövelés',
            order: 1,
            start_date: '2024-01-01',
            end_date: '2024-01-15',
            focus_goal: 'awareness',
            focus_description: 'Ismertségnövelés és márkaépítés',
            focus_segments: ['11111111-1111-1111-1111-111111111111'],
            focus_topics: ['22222222-2222-2222-2222-222222222222'],
            focus_channels: ['facebook'],
            success_indicators: [],
            focus_stage: 'awareness',
            focus_goals: ['87654321-4321-4321-4321-cba987654321'],
            focus_segments_primary: ['11111111-1111-1111-1111-111111111111'],
            focus_segments_secondary: [],
            focus_topics_primary: ['22222222-2222-2222-2222-222222222222'],
            focus_topics_secondary: [],
            focus_channels_primary: ['facebook'],
            focus_channels_secondary: [],
            suggested_weekly_post_volume: {
              total_posts_per_week: 10,
              video_posts_per_week: 3,
              stories_per_week: 5,
            },
            narrative_emphasis: ['33333333-3333-3333-3333-333333333333'],
            key_messages_summary: 'Ismertségnövelésre fókuszálunk.',
            success_criteria: ['10% márkaismertség növekedés'],
            risks_and_watchouts: ['Alacsony engagement', 'Korlátozott budget'],
          },
        ],
      }),
      usage: {
        completionTokens: 500,
      },
    }),
  }),
}))

const mockCampaignData = {
  data: {
    id: '12345678-1234-1234-1234-123456789abc',
    name: 'Test Campaign',
    campaign_type: 'political_issue',
    primary_goal_type: 'awareness',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    goals: [{ id: '87654321-4321-4321-4321-cba987654321', title: 'Test Goal', priority: 1, funnel_stage: 'awareness' }],
    segments: [{ id: '11111111-1111-1111-1111-111111111111', name: 'Test Segment', priority: 'primary' }],
    topics: [{ id: '22222222-2222-2222-2222-222222222222', name: 'Test Topic', priority: 'primary' }],
    narratives: [{ id: '33333333-3333-3333-3333-333333333333', title: 'Test Narrative', description: 'Test' }],
  },
  error: null,
}

const mockSingleFn = jest.fn().mockResolvedValue(mockCampaignData)

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    schema: () => ({
      from: (table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: mockSingleFn,
      }),
    }),
  }),
}))

jest.mock('@/lib/validation/campaign-structure', () => ({
  isReadyForExecution: jest.fn().mockReturnValue({
    ready: true,
    issues: [],
  }),
}))

describe('/api/ai/campaign-sprints', () => {
  beforeEach(() => {
    process.env.AI_MODEL = 'claude-3-5-sonnet-20241022'
  })

  it('should generate sprint plans for valid campaign', async () => {
    const request = new NextRequest('http://localhost/api/ai/campaign-sprints', {
      method: 'POST',
      body: JSON.stringify({ campaignId: 'test-campaign' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.ok).toBe(true)
    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
  })

  it('should return 400 when campaignId is missing', async () => {
    const request = new NextRequest('http://localhost/api/ai/campaign-sprints', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('campaignId is required')
  })

  it('should return 404 when campaign not found', async () => {
    // Mock campaign not found
    mockSingleFn.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    })

    const request = new NextRequest('http://localhost/api/ai/campaign-sprints', {
      method: 'POST',
      body: JSON.stringify({ campaignId: 'non-existent' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.error).toBe('Campaign not found')

    // Reset mock for subsequent tests
    mockSingleFn.mockResolvedValue(mockCampaignData)
  })

  it('should return 400 when campaign structure not validated', async () => {
    // Mock validation failure
    jest.requireMock('@/lib/validation/campaign-structure').isReadyForExecution.mockReturnValueOnce({
      ready: false,
      issues: ['Missing segments'],
    })

    const request = new NextRequest('http://localhost/api/ai/campaign-sprints', {
      method: 'POST',
      body: JSON.stringify({ campaignId: 'invalid-campaign' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Campaign structure not validated')
    expect(data.issues).toEqual(['Missing segments'])
  })
})