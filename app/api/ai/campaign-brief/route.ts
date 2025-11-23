import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { BRIEF_NORMALIZER_SYSTEM_PROMPT, BRIEF_NORMALIZER_USER_PROMPT } from '@/lib/ai/prompts/brief-normalizer'
import { STRATEGY_DESIGNER_SYSTEM_PROMPT, STRATEGY_DESIGNER_USER_PROMPT } from '@/lib/ai/prompts/strategy-designer'
import { BriefNormalizerOutputSchema } from '@/lib/ai/schemas'

export const maxDuration = 60 // Increase timeout for AI generation

export async function POST(req: NextRequest) {
  try {
    const { brief, campaignType, goalType } = await req.json()

    if (!brief) {
      return NextResponse.json({ error: 'Brief is required' }, { status: 400 })
    }

    const provider = getAIProvider()
    const model = process.env.AI_MODEL

    // Step 1: Brief Normalizer
    const normalizerResponse = await provider.generateText({
      model,
      maxTokens: 1024,
      systemPrompt: BRIEF_NORMALIZER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: BRIEF_NORMALIZER_USER_PROMPT(brief, campaignType, goalType) }
      ]
    })

    const normalizerContent = normalizerResponse.content
    
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
    const stream = provider.generateStream({
      model,
      maxTokens: 8192,
      systemPrompt: STRATEGY_DESIGNER_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: STRATEGY_DESIGNER_USER_PROMPT(normalizedBrief) }
      ]
    })

    const encoder = new TextEncoder()
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(chunk.content))
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
