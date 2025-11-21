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
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
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
      console.error('Brief Normalizer: Empty response')
      throw new Error('Empty response from Brief Normalizer')
    }

    // Extract JSON from response (handle markdown code blocks)
    let normalizerJsonContent = normalizerContent.trim()
    
    // Remove markdown code blocks if present
    if (normalizerJsonContent.startsWith('```')) {
      const lines = normalizerJsonContent.split('\n')
      const firstLine = lines[0]
      const lastLine = lines[lines.length - 1]
      
      // Remove first and last line if they are code block markers
      if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
        normalizerJsonContent = lines.slice(1, -1).join('\n')
      }
    }

    let normalizedBrief
    try {
      normalizedBrief = JSON.parse(normalizerJsonContent)
    } catch (parseError) {
      console.error('Brief Normalizer JSON Parse Error:', parseError)
      console.error('Raw Output:', normalizerContent)
      console.error('Extracted JSON:', normalizerJsonContent)
      return NextResponse.json({ 
        error: 'Failed to parse brief normalizer response as JSON',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 500 })
    }

    try {
      normalizedBrief = BriefNormalizerOutputSchema.parse(normalizedBrief)
    } catch (validationError) {
      console.error('Brief Normalizer Schema Validation Error:', validationError)
      console.error('Parsed JSON:', normalizedBrief)
      console.error('Raw Output:', normalizerContent)
      return NextResponse.json({ 
        error: 'Failed to validate brief normalizer output',
        details: validationError instanceof Error ? validationError.message : 'Schema validation failed'
      }, { status: 500 })
    }

    // Step 2: Strategy Designer
    const strategyResponse = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
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
      console.error('Strategy Designer: Empty response')
      throw new Error('Empty response from Strategy Designer')
    }

    // Extract JSON from response (handle markdown code blocks)
    let strategyJsonContent = strategyContent.trim()
    
    // Remove markdown code blocks if present
    if (strategyJsonContent.startsWith('```')) {
      const lines = strategyJsonContent.split('\n')
      const firstLine = lines[0]
      const lastLine = lines[lines.length - 1]
      
      // Remove first and last line if they are code block markers
      if (firstLine.match(/^```(json)?$/) && lastLine.match(/^```$/)) {
        strategyJsonContent = lines.slice(1, -1).join('\n')
      }
    }

    let campaignStructure
    try {
      campaignStructure = JSON.parse(strategyJsonContent)
    } catch (parseError) {
      console.error('Strategy Designer JSON Parse Error:', parseError)
      console.error('Raw Output:', strategyContent)
      console.error('Extracted JSON:', strategyJsonContent)
      return NextResponse.json({ 
        error: 'Failed to parse strategy designer response as JSON',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 500 })
    }

    try {
      campaignStructure = CampaignStructureSchema.parse(campaignStructure)
    } catch (validationError) {
      console.error('Strategy Designer Schema Validation Error:', validationError)
      console.error('Parsed JSON:', campaignStructure)
      console.error('Raw Output:', strategyContent)
      return NextResponse.json({ 
        error: 'Failed to validate strategy designer output',
        details: validationError instanceof Error ? validationError.message : 'Schema validation failed'
      }, { status: 500 })
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
