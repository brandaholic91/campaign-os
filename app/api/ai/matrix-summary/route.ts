import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

const MATRIX_SUMMARY_SYSTEM_PROMPT = `Te egy kampánystratégiai szakértő vagy. A feladatod, hogy rövid, koncíz összefoglalót írj egy célcsoport és egy téma közötti kapcsolatról.

FONTOS SZABÁLYOK:
1. Magyar nyelven kell kommunikálnod.
2. Az összefoglaló 2-3 mondatban, maximum 500 karakterben kell, hogy összefoglalja a kapcsolat lényegét.
3. Válaszolj CSAK az összefoglalóval, semmi mással.
4. Ne használj markdown formázást (pl. bold, italic, címek).
5. Ne használj idézőjeleket a szöveg elején vagy végén.
6. Ne használj kód blokkokat.
7. Csak a tiszta szöveget add vissza.

Az összefoglaló tartalmazza:
- Miért releváns ez a téma ennek a célcsoportnak
- Hogyan kapcsolódik a célcsoport jellemzőihez és érdekeihez
- Mi a stratégiai jelentősége a kapcsolatnak

PÉLDA HELYES VÁLASZRA:
Ez a téma kulcsfontosságú a célcsoport számára, mert közvetlenül kapcsolódik azok élethelyzetéhez és prioritásaihoz. A kapcsolat stratégiai jelentősége abban rejlik, hogy lehetővé teszi a célcsoport elérését a legmegfelelőbb kommunikációs csatornákon keresztül.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, segment_id, topic_id, importance, role } = body

    if (!campaign_id || !segment_id || !topic_id) {
      return NextResponse.json(
        { error: 'Missing required fields: campaign_id, segment_id, topic_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase.schema('campaign_os')

    // Fetch campaign context
    const { data: campaign, error: campaignError } = await db
      .from('campaigns')
      .select('campaign_type, primary_goal_type, description, narratives')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch segment and topic details
    const { data: segment } = await db
      .from('segments')
      .select('*')
      .eq('id', segment_id)
      .eq('campaign_id', campaign_id)
      .single()

    const { data: topic } = await db
      .from('topics')
      .select('*')
      .eq('id', topic_id)
      .eq('campaign_id', campaign_id)
      .single()

    if (!segment || !topic) {
      return NextResponse.json(
        { error: 'Segment or topic not found' },
        { status: 404 }
      )
    }

    // Parse narratives if available
    let narratives: Array<{ title: string; description: string }> = []
    try {
      const narrativesData = (campaign as any).narratives
      if (narrativesData && typeof narrativesData === 'object') {
        const parsed = Array.isArray(narrativesData) ? narrativesData : []
        narratives = parsed.filter((n: any) => n && typeof n === 'object' && n.title && n.description)
      }
    } catch (e) {
      console.warn('Failed to parse narratives:', e)
    }

    // Build user prompt
    const importanceLabel = importance === 'high' ? 'magas' : importance === 'low' ? 'alacsony' : 'közepes'
    const roleLabel = role === 'core_message' ? 'fő üzenet' : role === 'experimental' ? 'kísérleti' : 'támogató'

    const userPrompt = `Készíts egy rövid összefoglalót (2-3 mondat, max 500 karakter) a következő kapcsolatról:

Kampány típusa: ${campaign.campaign_type}
Kampány célja: ${campaign.primary_goal_type}
${campaign.description ? `Kampány leírása: ${campaign.description}` : ''}
${narratives.length > 0 ? `Narratívák: ${narratives.map(n => `${n.title}: ${n.description}`).join('; ')}` : ''}

Célcsoport: ${segment.name}
${segment.description ? `Leírás: ${segment.description}` : ''}
${segment.demographic_profile ? `Demográfiai profil: ${JSON.stringify(segment.demographic_profile)}` : ''}
${segment.psychographic_profile ? `Pszichográfiai profil: ${JSON.stringify(segment.psychographic_profile)}` : ''}

Téma: ${topic.name}
${topic.description ? `Leírás: ${topic.description}` : ''}
${topic.core_narrative ? `Alap narratíva: ${topic.core_narrative}` : ''}

Kapcsolat jellemzői:
- Fontosság: ${importanceLabel}
- Szerep: ${roleLabel}

Írj egy rövid, konkrét összefoglalót, ami magyarázza, miért releváns ez a téma ennek a célcsoportnak, és hogyan kapcsolódik a kampány céljaihoz.`

    const providerType = process.env.AI_PROVIDER || 'anthropic'
    const provider = getAIProvider()
    let model = process.env.AI_MODEL

    console.log('[Matrix Summary] Using provider:', providerType)
    console.log('[Matrix Summary] Original model:', model)

    if (!model) {
      return NextResponse.json(
        { error: 'AI_MODEL environment variable is not set' },
        { status: 500 }
      )
    }

    // For reasoning models (GPT-5, o1), use a non-reasoning model for simple summary generation
    // Reasoning models are overkill for this task and can consume all tokens on reasoning,
    // leaving no tokens for output. Use a faster, cheaper model instead.
    const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1')
    if (isReasoningModel && providerType === 'openai') {
      // Use GPT-4o-mini or gpt-4-turbo for summary generation instead
      model = 'gpt-4o-mini'
      console.log('[Matrix Summary] Switched from reasoning model to:', model, 'for summary generation')
    }

    const maxTokens = 256 // Standard models don't need as many tokens for a short summary
    
    console.log('[Matrix Summary] Token settings:', {
      isReasoningModel,
      maxTokens,
      promptLength: userPrompt.length,
      systemPromptLength: MATRIX_SUMMARY_SYSTEM_PROMPT.length,
      note: isReasoningModel ? 'Reasoning model - needs higher max_completion_tokens for output' : 'Standard model',
    })

    let response
    try {
      console.log('[Matrix Summary] Calling AI provider with model:', model)
      console.log('[Matrix Summary] Provider type:', providerType)
      console.log('[Matrix Summary] User prompt length:', userPrompt.length)
      console.log('[Matrix Summary] System prompt length:', MATRIX_SUMMARY_SYSTEM_PROMPT.length)
      console.log('[Matrix Summary] Max tokens:', maxTokens)
      
      response = await provider.generateText({
        model,
        maxTokens,
        systemPrompt: MATRIX_SUMMARY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      })
      
      console.log('[Matrix Summary] AI Response received successfully')
      console.log('[Matrix Summary] Response has content:', !!response.content)
      console.log('[Matrix Summary] Response content length:', response.content?.length || 0)
    } catch (aiError) {
      console.error('[Matrix Summary] Error calling AI provider:', aiError)
      console.error('[Matrix Summary] Error details:', {
        message: aiError instanceof Error ? aiError.message : String(aiError),
        stack: aiError instanceof Error ? aiError.stack : undefined,
        provider: providerType,
        model: model,
      })
      return NextResponse.json(
        { 
          error: 'Failed to generate summary. AI provider error.',
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    console.log('[Matrix Summary] AI Response object:', JSON.stringify(response, null, 2))
    console.log('[Matrix Summary] Response keys:', Object.keys(response))
    console.log('[Matrix Summary] Response content:', response.content)
    console.log('[Matrix Summary] Response content type:', typeof response.content)
    console.log('[Matrix Summary] Response content length:', response.content?.length)
    console.log('[Matrix Summary] Response model:', response.model)
    console.log('[Matrix Summary] Response usage:', response.usage)

    // Handle different response formats
    // Note: The AI provider should already convert content to string, but we handle edge cases
    let summary = ''
    if (response && response.content) {
      if (typeof response.content === 'string') {
        summary = response.content.trim()
      } else {
        // Fallback: convert to string
        summary = String(response.content).trim()
      }
    } else if (response && (response as any).text) {
      // Fallback for different response formats
      summary = String((response as any).text).trim()
    } else {
      console.error('No content found in response!')
      console.error('Response structure:', JSON.stringify(response, null, 2))
      console.error('Response type:', typeof response)
      console.error('Response content value:', response?.content)
      console.error('Response content type:', typeof response?.content)
      console.error('Response has content property:', 'content' in (response || {}))
      return NextResponse.json(
        { 
          error: 'AI response does not contain content. Please try again.',
          details: `Response structure: ${JSON.stringify(Object.keys(response || {}))}, content type: ${typeof response?.content}, has content: ${'content' in (response || {})}`
        },
        { status: 500 }
      )
    }

    console.log('Summary after extraction:', summary)
    console.log('Summary length:', summary.length)

    if (!summary || summary.length === 0) {
      console.error('Summary is empty after extraction! Response:', JSON.stringify(response, null, 2))
      return NextResponse.json(
        { error: 'Generated summary is empty. Please try again.' },
        { status: 500 }
      )
    }

    // Clean up potential markdown or quotes (more careful approach)
    const beforeCleanup = summary
    // Only remove quotes if they wrap the entire text
    if ((summary.startsWith('"') && summary.endsWith('"')) || 
        (summary.startsWith("'") && summary.endsWith("'"))) {
      summary = summary.slice(1, -1).trim()
    }
    // Remove markdown code blocks if present
    if (summary.includes('```')) {
      summary = summary.replace(/```[\w]*\n?/g, '').replace(/\n?```/g, '').trim()
    }
    console.log('Summary before cleanup:', beforeCleanup)
    console.log('Summary after cleanup:', summary)

    if (!summary || summary.length === 0) {
      console.error('Summary is empty after cleanup! Original:', beforeCleanup)
      // If cleanup removed everything, use the original
      summary = beforeCleanup.trim()
    }

    // Ensure max 500 characters
    if (summary.length > 500) {
      summary = summary.substring(0, 497) + '...'
    }

    console.log('Final summary:', summary)
    console.log('Final summary length:', summary.length)

    if (!summary || summary.length === 0) {
      console.error('Summary is still empty after all processing!')
      return NextResponse.json(
        { error: 'Generated summary is empty. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating matrix summary:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

