import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { STRATEGY_GENERATOR_SYSTEM_PROMPT, STRATEGY_GENERATOR_USER_PROMPT, StrategyGenerationContext } from '@/lib/ai/prompts/strategy-generator'
import { MessageGenerationRequestSchema, MessageStrategySchema, MessageStrategy } from '@/lib/ai/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, segment_ids, topic_ids, regenerate_combinations } = MessageGenerationRequestSchema.parse(body)
    
    // Parse regenerate combinations if provided
    const regenerateSet = new Set<string>()
    if (regenerate_combinations && Array.isArray(regenerate_combinations)) {
      regenerate_combinations.forEach((combo: string) => {
        const trimmed = combo.trim()
        if (trimmed) regenerateSet.add(trimmed)
      })
    }

    if (!segment_ids.length || !topic_ids.length) {
      return NextResponse.json({ error: 'At least one segment and topic required' }, { status: 400 })
    }

    // Fetch campaign context
    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    const { data: campaign, error: campaignError } = await db
      .from('campaigns')
      .select('campaign_type, primary_goal_type, narratives')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Type assertion for narratives field which may not be in generated types
    const campaignData = campaign as any

    // Fetch segments and topics
    const { data: segments } = await db
      .from('segments')
      .select('*')
      .in('id', segment_ids)
      .eq('campaign_id', campaign_id)

    const { data: topics } = await db
      .from('topics')
      .select('*')
      .in('id', topic_ids)
      .eq('campaign_id', campaign_id)

    if (!segments || !topics || segments.length === 0 || topics.length === 0) {
      return NextResponse.json({ error: 'Segments or topics not found' }, { status: 404 })
    }

    const provider = getAIProvider()
    const model = process.env.AI_MODEL
    
    if (!model) {
      return NextResponse.json({ 
        error: 'AI_MODEL environment variable is not set',
        details: 'Please set the AI_MODEL environment variable to use AI features'
      }, { status: 500 })
    }

    // Reasoning modelleknél (gpt-5, o1) több token kell, mert a reasoning tokenek is beleszámítanak
    // A max_completion_tokens tartalmazza a reasoning tokeneket ÉS a válasz tokeneket is
    const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1');
    const maxTokens = isReasoningModel ? 8192 : 4096; // Reasoning modelleknél több token, hogy legyen hely a válasznak

    const generatedStrategies: Array<{ segment_id: string; topic_id: string; strategy: MessageStrategy }> = []

    // Parse narratives if available
    let narratives: Array<{ title: string; description: string }> = []
    try {
      const narrativesData = campaignData.narratives
      if (narrativesData && typeof narrativesData === 'object') {
        const parsed = Array.isArray(narrativesData) ? narrativesData : []
        narratives = parsed.filter((n: any) => n && typeof n === 'object' && n.title && n.description)
      }
    } catch (e) {
      console.warn('Failed to parse narratives:', e)
    }

    // Generate strategies for each segment × topic combination
    for (const segment of segments) {
      for (const topic of topics) {
        const comboKey = `${segment.id}:${topic.id}`
        const shouldRegenerate = regenerateSet.size > 0 ? regenerateSet.has(comboKey) : true

        // Skip if specific combinations requested and this isn't one
        if (!shouldRegenerate && regenerateSet.size > 0) {
          continue
        }

        const context: StrategyGenerationContext = {
          campaign_type: campaignData.campaign_type,
          goal_type: campaignData.primary_goal_type,
          narratives: narratives.length > 0 ? narratives : undefined,
          segment: {
            id: segment.id,
            name: segment.name,
            description: segment.description || undefined,
            demographics: segment.demographics as Record<string, unknown> | undefined,
            psychographics: segment.psychographics as Record<string, unknown> | undefined,
          },
          topic: {
            id: topic.id,
            name: topic.name,
            description: topic.description || undefined,
            category: topic.category || undefined,
          },
        }

        try {
          console.log(`[Strategy Generation] Starting for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id})`)
          const response = await provider.generateText({
            model,
            maxTokens,
            systemPrompt: STRATEGY_GENERATOR_SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: STRATEGY_GENERATOR_USER_PROMPT(context) }
            ]
          })

          console.log(`[Strategy Generation] Received response for segment ${segment.name}, topic ${topic.name}`)
          const content = response.content

          if (!content) {
            console.error(`[Strategy Generation] Empty response for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id})`)
            console.error(`[Strategy Generation] Response structure:`, {
              contentLength: response.content.length,
            })
            continue
          }

          console.log(`[Strategy Generation] Content length: ${content.length} characters`)
          console.log(`[Strategy Generation] First 200 chars: ${content.substring(0, 200)}`)

          // Extract JSON from response (handle markdown code blocks and explanations)
          let jsonContent = content.trim()
          
          // Remove markdown code blocks if present (handle various formats)
          if (jsonContent.includes('```')) {
            // Find JSON code block
            const jsonBlockMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
            if (jsonBlockMatch && jsonBlockMatch[1]) {
              jsonContent = jsonBlockMatch[1].trim()
            } else {
              // Fallback: remove first and last lines if they are code block markers
              const lines = jsonContent.split('\n')
              const firstLine = lines[0]?.trim()
              const lastLine = lines[lines.length - 1]?.trim()
              
              if (firstLine?.match(/^```(json)?$/) && lastLine?.match(/^```$/)) {
                jsonContent = lines.slice(1, -1).join('\n').trim()
              }
            }
          }
          
          // Try to extract JSON object if there's text before/after
          const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/)
          if (jsonObjectMatch) {
            jsonContent = jsonObjectMatch[0]
          }

          let strategyData
          try {
            strategyData = JSON.parse(jsonContent)
          } catch (parseError) {
            console.error(`JSON parse error for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, parseError)
            console.error('Raw output:', content.substring(0, 500)) // Limit log size
            console.error('Extracted JSON:', jsonContent.substring(0, 500))
            console.error('Parse error details:', parseError instanceof Error ? parseError.message : String(parseError))
            continue
          }

          // Validate strategy
          try {
            // Normalize data to match schema constraints before validation
            // Fix cta_patterns array length (2-3 items)
            if (strategyData.cta_funnel?.cta_patterns && Array.isArray(strategyData.cta_funnel.cta_patterns)) {
              const patterns = strategyData.cta_funnel.cta_patterns
              if (patterns.length > 3) {
                console.warn(`[Strategy Generation] cta_patterns has ${patterns.length} items, truncating to 3`)
                strategyData.cta_funnel.cta_patterns = patterns.slice(0, 3)
              } else if (patterns.length < 2 && patterns.length > 0) {
                console.warn(`[Strategy Generation] cta_patterns has only ${patterns.length} item, padding to 2`)
                strategyData.cta_funnel.cta_patterns = [patterns[0], patterns[0]]
              }
            }
            
            // Fix supporting_messages array length (3-5 items)
            if (strategyData.strategy_core?.supporting_messages && Array.isArray(strategyData.strategy_core.supporting_messages)) {
              const messages = strategyData.strategy_core.supporting_messages
              if (messages.length > 5) {
                console.warn(`[Strategy Generation] supporting_messages has ${messages.length} items, truncating to 5`)
                strategyData.strategy_core.supporting_messages = messages.slice(0, 5)
              } else if (messages.length < 3 && messages.length > 0) {
                console.warn(`[Strategy Generation] supporting_messages has only ${messages.length} items, padding to 3`)
                const padded = [...messages]
                while (padded.length < 3) {
                  padded.push(messages[padded.length % messages.length])
                }
                strategyData.strategy_core.supporting_messages = padded
              }
            }
            
            // Fix proof_points array length (2-3 items)
            if (strategyData.strategy_core?.proof_points && Array.isArray(strategyData.strategy_core.proof_points)) {
              const points = strategyData.strategy_core.proof_points
              if (points.length > 3) {
                console.warn(`[Strategy Generation] proof_points has ${points.length} items, truncating to 3`)
                strategyData.strategy_core.proof_points = points.slice(0, 3)
              } else if (points.length < 2 && points.length > 0) {
                console.warn(`[Strategy Generation] proof_points has only ${points.length} item, padding to 2`)
                strategyData.strategy_core.proof_points = [points[0], points[0]]
              }
            }
            
            // Fix tone_profile keywords array length (3-5 items)
            if (strategyData.style_tone?.tone_profile?.keywords && Array.isArray(strategyData.style_tone.tone_profile.keywords)) {
              const keywords = strategyData.style_tone.tone_profile.keywords
              if (keywords.length > 5) {
                console.warn(`[Strategy Generation] tone_profile.keywords has ${keywords.length} items, truncating to 5`)
                strategyData.style_tone.tone_profile.keywords = keywords.slice(0, 5)
              } else if (keywords.length < 3 && keywords.length > 0) {
                console.warn(`[Strategy Generation] tone_profile.keywords has only ${keywords.length} items, padding to 3`)
                const padded = [...keywords]
                while (padded.length < 3) {
                  padded.push(keywords[padded.length % keywords.length])
                }
                strategyData.style_tone.tone_profile.keywords = padded
              }
            }
            
            // Construct the preview summary manually if missing, as per AC #5
            if (!strategyData.preview_summary) {
                const pos = strategyData.strategy_core?.positioning_statement || '';
                const core = strategyData.strategy_core?.core_message || '';
                const tone = strategyData.style_tone?.tone_profile?.keywords?.join(', ') || '';
                const stage = strategyData.cta_funnel?.funnel_stage || '';
                
                // Simple truncation for summary
                const posSummary = pos.split('.').slice(0, 2).join('.') + '.';
                
                strategyData.preview_summary = `Positioning: ${posSummary} Core: ${core} Tone: ${tone}. Stage: ${stage}`;
            }

            const validatedStrategy = MessageStrategySchema.parse(strategyData)
            
            generatedStrategies.push({
              segment_id: segment.id,
              topic_id: topic.id,
              strategy: validatedStrategy
            })
          } catch (validationError) {
            console.error(`Validation error for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, validationError)
            console.error('Validation error details:', validationError instanceof Error ? validationError.message : String(validationError))
            if (validationError instanceof Error && 'issues' in validationError) {
              console.error('Zod validation issues:', (validationError as any).issues)
            }
            console.error('Parsed strategyData keys:', Object.keys(strategyData || {}))
            console.error('Raw output (first 500 chars):', content.substring(0, 500))
            continue
          }
        } catch (error) {
          console.error(`Error generating strategy for segment ${segment.name} (${segment.id}), topic ${topic.name} (${topic.id}):`, error)
          if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
          }
          // Continue with next combination
          continue
        }
      }
    }

    if (generatedStrategies.length === 0) {
      const totalCombinations = segments.length * topics.length
      console.error('No strategies generated. Total combinations attempted:', totalCombinations)
      console.error('Segments:', segments.map(s => ({ id: s.id, name: s.name })))
      console.error('Topics:', topics.map(t => ({ id: t.id, name: t.name })))
      console.error('Campaign ID:', campaign_id)
      console.error('Campaign data:', campaignData)
      
      // Check if there were any errors during generation
      // We should have logged errors above, but let's provide a more helpful error message
      return NextResponse.json({ 
        error: 'Nem sikerült stratégiát generálni',
        details: `${totalCombinations} kombinációt próbáltunk meg generálni, de egyik sem sikerült. Lehetséges okok: AI válasz nem tartalmazott érvényes JSON-t, validációs hiba, vagy hálózati probléma. Kérlek, ellenőrizd a szerver logokat további részletekért.`,
        debug: {
          totalCombinations,
          segmentsCount: segments.length,
          topicsCount: topics.length,
          campaignId: campaign_id
        }
      }, { status: 500 })
    }

    return NextResponse.json({ strategies: generatedStrategies })

  } catch (error) {
    console.error('Strategy Generation Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
