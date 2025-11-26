import { ContentDraft } from '@/lib/ai/schemas'

export interface ContentDraftGeneratorContext {
  slot: {
    id: string
    date: string
    channel: string
    content_type: string
    objective: string
    funnel_stage: string
    angle_type: string
    angle_hint?: string
    cta_type: string
    tone_override?: string
    time_of_day?: string
    notes?: string
  }
  primary_segment?: {
    id: string
    name: string
    demographic_profile?: any
    psychographic_profile?: any
    media_habits?: any
  }
  secondary_segments?: Array<{
    id: string
    name: string
  }>
  primary_topic?: {
    id: string
    name: string
    core_narrative?: string
    content_angles?: string[]
  }
  secondary_topics?: Array<{
    id: string
    name: string
  }>
  related_goals?: Array<{
    id: string
    title: string
    funnel_stage?: string
    kpi_hint?: string
  }>
  message_strategy?: {
    strategy_core?: {
      positioning_statement?: string
      core_message?: string
      supporting_messages?: string[]
      proof_points?: string[]
    }
    style_tone?: {
      tone_profile?: {
        description?: string
        keywords?: string[]
      }
      language_style?: string
      communication_guidelines?: {
        do?: string[]
        dont?: string[]
      }
      emotional_temperature?: string
    }
    cta_funnel?: {
      funnel_stage?: string
      cta_objectives?: string[]
      cta_patterns?: string[]
      friction_reducers?: string[]
    }
    extra_fields?: {
      framing_type?: string
      key_phrases?: string[]
      risk_notes?: string
    }
  }
  variant_count: number
  tone_preference?: string
}

export const CONTENT_DRAFT_GENERATOR_SYSTEM_PROMPT = `You are an expert Content Copywriter and Creative Strategist.
You MUST always communicate in Hungarian (magyar nyelv).

Your task is to generate content drafts (copy variants) for a specific content slot in a marketing campaign.

CRITICAL: You are generating CONCRETE COPY, not just planning. Each draft must include:
- hook: Attention-grabbing opening (1-2 sentences, min 10 chars)
- body: Main message/content (engaging, min 50 chars)
- cta_copy: Call-to-action text (based on cta_type, min 5 chars)
- visual_idea: Visual concept description (2-5 sentences, min 20 chars, describe what to show)
- alt_text_suggestion: Accessibility-focused alt text (if visual applicable)
- length_hint: Content length guidance (based on content_type, e.g., "max. 100 szó", "15s videó", "3-5 slide")
- tone_notes: Tone execution notes (if tone_override present in slot or strategy)

You must generate ${'{variant_count}'} content draft variants with slight variations.

Output Format:
You must output a JSON object with a single key 'drafts' containing an array of content draft objects.
Each draft must have:

**Required Fields:**
- hook: String, 1-2 sentences, attention-grabbing, min 10 characters
  * Start strong - question, stat, bold claim, or story hook
  * Match the angle_type (story → personal hook, proof → data hook, how_to → problem hook)
  * If message strategy available: align with positioning_statement and core_message

- body: String, main text, engaging, min 50 characters
  * Expand on the hook with key message
  * Include 1-2 supporting points or proof points
  * Match the content_type length expectations (short_video → 50-100 words, carousel → 100-200 words, etc.)
  * If message strategy available: use supporting_messages and proof_points
  * Respect communication_guidelines (do/don't) if available

- cta_copy: String, call-to-action text, min 5 characters
  * Match cta_type exactly:
    - soft_info: "További infók a bio-ban", "Link a kommentben"
    - learn_more: "Tudj meg többet", "Olvass tovább"
    - signup: "Iratkozz fel", "Csatlakozz"
    - donate: "Támogass minket", "Adományozz"
    - attend_event: "Gyere el", "Regisztrálj most"
    - share: "Oszd meg", "Tag egy barátot"
    - comment: "Írd meg a véleményed", "Reagálj"
  * If message strategy available: use cta_patterns and friction_reducers

- visual_idea: String, 2-5 sentences, descriptive, min 20 characters
  * Describe what to show visually (photo, video, graphic)
  * Match content_type (static_image → single photo concept, carousel → multi-slide concept, short_video → scene description)
  * Match angle_type (story → behind-the-scenes/personal, proof → data viz/results, testimonial → person/quote overlay)
  * Be specific but allow creative execution
  * Example: "Közeli felvétel egy önkéntesről, amint egy idős személlyel beszélget. Meleg, természetes fény. Az idős ember mosolyog. Overlay text: a program neve."

**Optional Fields:**
- alt_text_suggestion: String, accessibility-focused description (optional, for images/videos)
  * Concise description of visual content for screen readers
  * Example: "Egy önkéntes és egy idős ember beszélgetnek egy napfényes szobában"

- length_hint: String, content length guidance (optional, based on content_type)
  * short_video: "15-30s videó, max. 100 szó"
  * story: "5-10s, 1-2 mondat, max. 50 szó"
  * static_image: "max. 150 szó szöveg"
  * carousel: "3-5 slide, slide-onként 50-100 szó"
  * email: "max. 300 szó, rövid bekezdések"
  * long_post: "300-500 szó, több bekezdés"

- tone_notes: String, tone execution notes (optional, ONLY if tone_override present in slot or strategy has specific tone guidance)
  * If slot.tone_override present: use it
  * If message strategy available: use style_tone.tone_profile, emotional_temperature, language_style
  * Example: "Közvetlen, barátságos, de professzionális. Kerüld a marketinges kifejezéseket."

**Variant Generation Strategy:**
Generate ${'{variant_count}'} variants with these differences:
1. Variant 1: Standard approach (baseline)
2. Variant 2 (if requested): Different hook approach (e.g., question vs statement, stat vs story)
3. Variant 3 (if requested): Different visual emphasis or body structure

Each variant should be distinct but aligned with slot context and strategy.

**Hungarian Language Requirements:**
- ALL text content (hook, body, cta_copy, visual_idea, alt_text_suggestion, length_hint, tone_notes) MUST be in Hungarian
- Use natural, conversational Hungarian (not literal translations)
- Respect Hungarian grammar and punctuation
- Use informal "te" or formal "Ön" based on segment demographics (default: informal "te" unless strategy specifies formal tone)

Do not include any explanation or markdown formatting, just the raw JSON.`

export const CONTENT_DRAFT_GENERATOR_USER_PROMPT = (context: ContentDraftGeneratorContext) => {
  const {
    slot,
    primary_segment,
    secondary_segments,
    primary_topic,
    secondary_topics,
    related_goals,
    message_strategy,
    variant_count,
    tone_preference
  } = context

  // Build segment context
  let segmentContext = ''
  if (primary_segment) {
    segmentContext += `PRIMARY SEGMENT: ${primary_segment.name} (ID: ${primary_segment.id})\n`
    if (primary_segment.demographic_profile) {
      segmentContext += `  Demographics: ${JSON.stringify(primary_segment.demographic_profile)}\n`
    }
    if (primary_segment.psychographic_profile) {
      segmentContext += `  Psychographics: ${JSON.stringify(primary_segment.psychographic_profile)}\n`
    }
    if (primary_segment.media_habits) {
      segmentContext += `  Media Habits: ${JSON.stringify(primary_segment.media_habits)}\n`
    }
  }

  if (secondary_segments && secondary_segments.length > 0) {
    segmentContext += `\nSECONDARY SEGMENTS:\n`
    for (const seg of secondary_segments) {
      segmentContext += `  - ${seg.name} (ID: ${seg.id})\n`
    }
  }

  // Build topic context
  let topicContext = ''
  if (primary_topic) {
    topicContext += `PRIMARY TOPIC: ${primary_topic.name} (ID: ${primary_topic.id})\n`
    if (primary_topic.core_narrative) {
      topicContext += `  Core Narrative: ${primary_topic.core_narrative}\n`
    }
    if (primary_topic.content_angles && primary_topic.content_angles.length > 0) {
      topicContext += `  Content Angles: ${primary_topic.content_angles.join(', ')}\n`
    }
  }

  if (secondary_topics && secondary_topics.length > 0) {
    topicContext += `\nSECONDARY TOPICS:\n`
    for (const topic of secondary_topics) {
      topicContext += `  - ${topic.name} (ID: ${topic.id})\n`
    }
  }

  // Build goals context
  let goalsContext = ''
  if (related_goals && related_goals.length > 0) {
    goalsContext = `RELATED GOALS:\n`
    for (const goal of related_goals) {
      goalsContext += `  - ${goal.title} (${goal.funnel_stage || 'N/A'}${goal.kpi_hint ? `, KPI: ${goal.kpi_hint}` : ''})\n`
    }
  }

  // Build message strategy context (CRITICAL)
  let strategyContext = ''
  if (message_strategy) {
    strategyContext = `\nMESSAGE STRATEGY (CRITICAL - Use this to guide copy generation):\n`

    if (message_strategy.strategy_core) {
      strategyContext += `\n[Strategy Core]:\n`
      if (message_strategy.strategy_core.positioning_statement) {
        strategyContext += `  Positioning: ${message_strategy.strategy_core.positioning_statement}\n`
      }
      if (message_strategy.strategy_core.core_message) {
        strategyContext += `  Core Message: ${message_strategy.strategy_core.core_message}\n`
      }
      if (message_strategy.strategy_core.supporting_messages && message_strategy.strategy_core.supporting_messages.length > 0) {
        strategyContext += `  Supporting Messages:\n${message_strategy.strategy_core.supporting_messages.map((m: string) => `    - ${m}`).join('\n')}\n`
      }
      if (message_strategy.strategy_core.proof_points && message_strategy.strategy_core.proof_points.length > 0) {
        strategyContext += `  Proof Points:\n${message_strategy.strategy_core.proof_points.map((p: string) => `    - ${p}`).join('\n')}\n`
      }
    }

    if (message_strategy.style_tone) {
      strategyContext += `\n[Style & Tone]:\n`
      if (message_strategy.style_tone.tone_profile) {
        strategyContext += `  Tone Profile: ${message_strategy.style_tone.tone_profile.description || 'N/A'}\n`
        if (message_strategy.style_tone.tone_profile.keywords && message_strategy.style_tone.tone_profile.keywords.length > 0) {
          strategyContext += `  Tone Keywords: ${message_strategy.style_tone.tone_profile.keywords.join(', ')}\n`
        }
      }
      if (message_strategy.style_tone.language_style) {
        strategyContext += `  Language Style: ${message_strategy.style_tone.language_style}\n`
      }
      if (message_strategy.style_tone.emotional_temperature) {
        strategyContext += `  Emotional Temperature: ${message_strategy.style_tone.emotional_temperature}\n`
      }
      if (message_strategy.style_tone.communication_guidelines) {
        if (message_strategy.style_tone.communication_guidelines.do && message_strategy.style_tone.communication_guidelines.do.length > 0) {
          strategyContext += `  Do:\n${message_strategy.style_tone.communication_guidelines.do.map((d: string) => `    - ${d}`).join('\n')}\n`
        }
        if (message_strategy.style_tone.communication_guidelines.dont && message_strategy.style_tone.communication_guidelines.dont.length > 0) {
          strategyContext += `  Don't:\n${message_strategy.style_tone.communication_guidelines.dont.map((d: string) => `    - ${d}`).join('\n')}\n`
        }
      }
    }

    if (message_strategy.cta_funnel) {
      strategyContext += `\n[CTA & Funnel]:\n`
      if (message_strategy.cta_funnel.cta_objectives && message_strategy.cta_funnel.cta_objectives.length > 0) {
        strategyContext += `  CTA Objectives:\n${message_strategy.cta_funnel.cta_objectives.map((o: string) => `    - ${o}`).join('\n')}\n`
      }
      if (message_strategy.cta_funnel.cta_patterns && message_strategy.cta_funnel.cta_patterns.length > 0) {
        strategyContext += `  CTA Patterns:\n${message_strategy.cta_funnel.cta_patterns.map((p: string) => `    - ${p}`).join('\n')}\n`
      }
      if (message_strategy.cta_funnel.friction_reducers && message_strategy.cta_funnel.friction_reducers.length > 0) {
        strategyContext += `  Friction Reducers:\n${message_strategy.cta_funnel.friction_reducers.map((f: string) => `    - ${f}`).join('\n')}\n`
      }
    }

    if (message_strategy.extra_fields) {
      strategyContext += `\n[Extra Context]:\n`
      if (message_strategy.extra_fields.framing_type) {
        strategyContext += `  Framing Type: ${message_strategy.extra_fields.framing_type}\n`
      }
      if (message_strategy.extra_fields.key_phrases && message_strategy.extra_fields.key_phrases.length > 0) {
        strategyContext += `  Key Phrases: ${message_strategy.extra_fields.key_phrases.join(', ')}\n`
      }
      if (message_strategy.extra_fields.risk_notes) {
        strategyContext += `  Risk Notes: ${message_strategy.extra_fields.risk_notes}\n`
      }
    }
  } else {
    strategyContext = `\nMESSAGE STRATEGY: None available - generate copy based on slot context, angle_type, and general best practices.\n`
  }

  return `
GENERATE ${variant_count} CONTENT DRAFT VARIANT${variant_count > 1 ? 'S' : ''} FOR CONTENT SLOT

SLOT CONTEXT:
- ID: ${slot.id}
- Date: ${slot.date}
- Channel: ${slot.channel}
- Content Type: ${slot.content_type}
- Time of Day: ${slot.time_of_day || 'unspecified'}
- Objective: ${slot.objective}
- Funnel Stage: ${slot.funnel_stage}
- Angle Type: ${slot.angle_type}
${slot.angle_hint ? `- Angle Hint: ${slot.angle_hint}` : ''}
- CTA Type: ${slot.cta_type}
${slot.tone_override ? `- Tone Override: ${slot.tone_override}` : ''}
${slot.notes ? `- Notes: ${slot.notes}` : ''}

${segmentContext}

${topicContext}

${goalsContext}
${strategyContext}
${tone_preference ? `\nTONE PREFERENCE (User Override): ${tone_preference}\n` : ''}

INSTRUCTIONS:
1. Generate EXACTLY ${variant_count} content draft variant${variant_count > 1 ? 's' : ''}.
2. Each draft MUST include ALL required fields: hook, body, cta_copy, visual_idea.
3. CRITICAL: If message strategy is available, it should HEAVILY influence your copy:
   - Hook and body should align with positioning_statement and core_message
   - Use supporting_messages and proof_points in body
   - Follow style_tone guidelines (tone_profile, language_style, communication_guidelines)
   - Use cta_patterns for cta_copy
4. Match angle_type for hook approach:
   - story: Personal narrative, journey, behind-the-scenes
   - proof: Data, statistics, evidence, results
   - how_to: Tutorial, guide, educational content
   - comparison: Before/after, us vs them, alternatives
   - behind_the_scenes: Process, transparency, authenticity
   - testimonial: User stories, social proof, reviews
   - other: General approach
5. Match cta_type for cta_copy (see system prompt for examples).
6. Match content_type for body length and visual_idea:
   - short_video: 50-100 words body, 15-30s scene description
   - story: 20-50 words body, 5-10s scene description
   - static_image: 100-150 words body, single image concept
   - carousel: 100-200 words body, multi-slide concept (3-5 slides)
   - email: 200-300 words body, email-specific visual (header/footer)
   - long_post: 300-500 words body, detailed visual concept
7. Variants should differ in:
   - Variant 1: Standard approach (baseline)
   - Variant 2: Different hook approach (e.g., question vs statement)
   - Variant 3: Different visual emphasis or body structure
8. ALL text MUST be in Hungarian (magyar nyelv).
9. Optional fields (alt_text_suggestion, length_hint, tone_notes) should be included when relevant.

CRITICAL: Message strategy should be the PRIMARY guide for copy generation. Slot context (angle_type, cta_type) is secondary.

Return JSON object: { "drafts": [...] }
`
}
