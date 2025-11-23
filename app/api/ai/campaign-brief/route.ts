import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { BRIEF_NORMALIZER_SYSTEM_PROMPT, BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_SYSTEM_PROMPT, STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'
import { BriefNormalizerOutputSchema, CampaignStructureSchema } from '@/lib/ai/schemas'

export const maxDuration = 60 // Increase timeout for AI generation

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

    // Step 2: Strategy Designer (Streaming)
    const stream = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 8192,
      system: STRATEGY_DESIGNER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: STRATEGY_DESIGNER_USER_PROMPT(normalizedBrief) }
      ],
      stream: true,
    }, {
      timeout: 120 * 1000 // 2 minutes timeout
    })

    const encoder = new TextEncoder()
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error) {
    console.error('Campaign Generation Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
