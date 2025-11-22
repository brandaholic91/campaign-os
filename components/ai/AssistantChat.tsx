'use client'

import { CopilotPopup } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'

interface AssistantChatProps {
  className?: string
  campaignType?: string
  goalType?: string
  formFields?: {
    name?: string
    description?: string
    budget_estimate?: number
  }
}

/**
 * Kampánysegéd (Campaign Assistant) - Real-time streaming chat interface
 * Uses CopilotKit's CopilotPopup for real-time message streaming and bi-directional state sync
 * AC: #1, #2, #6, #8
 */
export function AssistantChat({ 
  className,
  campaignType,
  goalType,
  formFields 
}: AssistantChatProps) {
  // Build contextual instructions based on current form state
  const instructions = `Te vagy a Kampánysegéd, egy szakértő AI asszisztens a kommunikációs és közösségi média kampánytervezésben.

JELENLEGI KAMPÁNY KÖRNYEZET:
${campaignType ? `- Kampány típusa: ${campaignType}` : ''}
${goalType ? `- Elsődleges cél: ${goalType}` : ''}
${formFields?.name ? `- Kampány neve: ${formFields.name}` : ''}
${formFields?.description ? `- Leírás: ${formFields.description}` : ''}

FELADATOD:
1. Segíts a felhasználónak a kampány létrehozásában és szerkesztésében
2. Válaszolj kontextuális kérdésekre a kampány típusa és célja alapján
3. Javasolj mezőértékeket a kampány beállításaihoz
4. Hívj fel figyelmet olyan mezőkre, amelyek figyelmet igényelnek
5. Navigálj a felhasználót a releváns wizard lépésekhez
6. Ha a felhasználó teljes kampány generálást kér, indítsd el a deep campaign orchestrator-t

ELÉRHETŐ ESZKÖZÖK:
- highlightField(field_id): Kiemel egy mezőt a figyelem felhívásához
- prefillField(field_id, value): Kitölt egy mezőt javasolt értékkel
- navigateToStep(step_id): Navigál egy wizard lépéshez
- openSuggestionModal(type, payload): Megnyit egy javaslat modalt
- generateCampaignStructure(brief, campaignType, goalType): Teljes kampány struktúra generálása

VÁLASZOLJ MAGYARUL, RÖVIDEN ÉS KONKRÉTAN.`

  return (
    <CopilotPopup
      className={className}
      instructions={instructions}
      labels={{
        title: 'Kampánysegéd',
        initial: 'Szia! 👋 Segíthetek a kampány létrehozásában. Kérdezz bármit!',
      }}
      defaultOpen={false}
      clickOutsideToClose={true}
      hitEscapeToClose={true}
      shortcut="/"
    />
  )
}
