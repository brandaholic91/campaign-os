import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { BRIEF_NORMALIZER_SYSTEM_PROMPT, BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_SYSTEM_PROMPT, STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'
import { BriefNormalizerOutputSchema, CampaignStructureSchema } from '@/lib/ai/schemas'

export async function POST(req: NextRequest) {
  try {
    const { brief, campaignType, goalType } = await req.json()

    if (!brief) {
      return NextResponse.json({ error: 'Brief is required' }, { status: 400 })
    }

    const client = getAnthropicClient()

    // Step 1: Brief Normalizer
    const normalizerResponse = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: BRIEF_NORMALIZER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: BRIEF_NORMALIZER_USER_PROMPT(brief, campaignType, goalType) }
      ]
    })

    const normalizerContent = normalizerResponse.content[0].type === 'text' 
      ? normalizerResponse.content[0].text 
      : ''
    
    if (!normalizerContent) {
      throw new Error('Empty response from Brief Normalizer')
    }

    let normalizedBrief
    try {
      normalizedBrief = JSON.parse(normalizerContent)
      normalizedBrief = BriefNormalizerOutputSchema.parse(normalizedBrief)
    } catch (e) {
      console.error('Brief Normalizer Validation Error:', e)
      console.error('Raw Output:', normalizerContent)
      return NextResponse.json({ error: 'Failed to normalize brief' }, { status: 500 })
    }

    // Step 2: Strategy Designer
    const strategyResponse = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: STRATEGY_DESIGNER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: STRATEGY_DESIGNER_USER_PROMPT(normalizedBrief) }
      ]
    })

    const strategyContent = strategyResponse.content[0].type === 'text'
      ? strategyResponse.content[0].text
      : ''

    if (!strategyContent) {
      throw new Error('Empty response from Strategy Designer')
    }

    let campaignStructure
    try {
      campaignStructure = JSON.parse(strategyContent)
      campaignStructure = CampaignStructureSchema.parse(campaignStructure)
    } catch (e) {
      console.error('Strategy Designer Validation Error:', e)
      console.error('Raw Output:', strategyContent)
      return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 })
    }

    return NextResponse.json(campaignStructure)

  } catch (error) {
    console.error('Campaign Generation Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
