'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowLeft, Loader2, Check, Calendar } from 'lucide-react'
import Link from 'next/link'
import { CampaignStructurePreview } from '@/components/ai/CampaignStructurePreview'
import { toast } from 'sonner'
import { useCopilotAction, useCopilotReadable, useCopilotChat } from '@copilotkit/react-core'
import { TextMessage, Role as MessageRole, ResultMessage, Message as DeprecatedGqlMessage } from '@copilotkit/runtime-client-gql'
import { jsonrepair } from 'jsonrepair'
import { highlightField, prefillField } from '@/lib/ai/copilotkit/tools'
import { CampaignStructureSchema } from '@/lib/ai/schemas'

// Custom Tag Input Component for list-based fields
const TagInput: React.FC<{
  label: string
  placeholder: string
  tags: string[]
  onChange: (tags: string[]) => void
  help?: string
}> = ({ label, placeholder, tags, onChange, help }) => {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      onChange([...tags, input.trim()])
      setInput('')
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all min-h-[48px]">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-sm border border-primary-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-primary-400 hover:text-primary-600 focus:outline-none"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm min-w-[120px] p-1"
        />
      </div>
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  )
}

export default function CampaignAIPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7
  const [generatedStructure, setGeneratedStructure] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isManualGenerating, setIsManualGenerating] = useState(false)
  const [progressStage, setProgressStage] = useState<'idle' | 'brief-normalizer' | 'strategy-designer' | 'done'>('idle')

  // Form State - same as CampaignWizard
  const [formData, setFormData] = useState({
    // Step 1: Alapadatok
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    geo: '',
    description: '',

    // Step 2: Célok
    primaryGoal: '',
    goalType: '',
    secondaryGoals: [] as string[],
    nonGoals: '',

    // Step 3: Márka/Identitás
    identity: '',
    positioning: '',
    usps: [] as string[],

    // Step 4: Célcsoport
    targetTags: [] as string[],
    existingPersonas: '',
    attitudes: '',

    // Step 5: Üzenetirányok
    messages: [] as string[],
    taboos: [] as string[],
    motifs: '',
    tone: '',

    // Step 6: Csatornák
    channels: [] as string[],
    excludedChannels: [] as string[],
    budget: 'medium',
    constraints: '',

    // Step 7: Tapasztalatok
    historyWorked: '',
    historyFailed: '',
    references: '',
    legal: '',
  })

  const steps = [
    { id: 1, title: 'Alapadatok', desc: 'Kampány neve, típusa, ideje' },
    { id: 2, title: 'Célok', desc: 'Elsődleges és másodlagos célok' },
    { id: 3, title: 'Identitás', desc: 'Márka, pozicionálás, USP' },
    { id: 4, title: 'Célcsoport', desc: 'Personák és attitűdök' },
    { id: 5, title: 'Üzenetek', desc: 'Fő üzenetek és tónus' },
    { id: 6, title: 'Erőforrások', desc: 'Csatornák és költségkeret' },
    { id: 7, title: 'Kontextus', desc: 'Tapasztalatok és korlátok' },
  ]

  // CopilotKit chat for streaming
  const { appendMessage, isLoading: isGenerating, stopGeneration, visibleMessages } = useCopilotChat({
    id: 'campaign-ai-generation'
  })

  const handleSave = async (structure: any) => {
    if (!formData.name) {
      toast.error('Kérlek adj meg egy kampány nevet')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/campaigns/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: {
            name: formData.name,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            campaignType: formData.type,
            goalType: formData.goalType
          },
          structure
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save campaign')
      }

      const data = await response.json()
      toast.success('Kampány sikeresen létrehozva!')
      window.location.href = `/campaigns/${data.campaignId}`
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a mentés során')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWizard = async () => {
    if (!formData.name) {
      toast.error('Kérlek adj meg egy kampány nevet')
      return
    }

    if (!formData.type || !formData.startDate || !formData.endDate || !formData.goalType) {
      toast.error('Kérlek töltsd ki az összes kötelező mezőt')
      return
    }

    setIsSaving(true)
    try {
      const requestBody = {
        campaign: {
          name: formData.name,
          description: formData.description || '',
          startDate: formData.startDate,
          endDate: formData.endDate,
          campaignType: formData.type,
          goalType: formData.goalType,
          budgetEstimate: formData.budget === 'low' ? 0 : formData.budget === 'medium' ? 1000 : 5000
        },
        wizardData: formData
      }

      console.log('Sending save request:', requestBody)

      const response = await fetch('/api/campaigns/save-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status, response.statusText)

      let responseData
      try {
        const responseText = await response.text()
        console.log('Response text:', responseText)
        responseData = responseText ? JSON.parse(responseText) : null
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error(`Hibás válasz a szervertől: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Hiba: ${response.status} ${response.statusText}`
        console.error('Save error:', errorMessage, responseData)
        throw new Error(errorMessage)
      }

      if (responseData?.campaignId) {
        toast.success('Kampány sikeresen mentve!')
        window.location.href = `/campaigns/${responseData.campaignId}`
      } else {
        console.error('No campaignId in response:', responseData)
        throw new Error('Nem sikerült megkapni a kampány ID-t')
      }
    } catch (error) {
      console.error('Save wizard error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Hiba történt a mentés során'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Expose form state to CopilotKit agent
  useCopilotReadable(
    {
      description: 'Campaign AI form state including all wizard steps data',
      value: formData,
    },
    [formData]
  )

  // Register frontend tools for agent
  useCopilotAction({
    name: 'highlightField',
    description: 'Highlight a form field to draw user attention',
    parameters: [
      {
        name: 'fieldId',
        type: 'string' as const,
        description: 'The data-field-id attribute value of the field to highlight',
        required: true,
      },
      {
        name: 'duration',
        type: 'number' as const,
        description: 'Duration in milliseconds (default: 3000)',
        required: false,
      },
      {
        name: 'color',
        type: 'string' as const,
        description: 'CSS color for highlight (default: yellow)',
        required: false,
      },
    ],
    handler: ({ fieldId, duration, color }: { fieldId: string; duration?: number; color?: string }) => {
      highlightField(fieldId, { duration, color })
      return { success: true, message: `Highlighted field: ${fieldId}` }
    },
  })

  useCopilotAction({
    name: 'prefillField',
    description: 'Prefill a form field with a suggested value',
    parameters: [
      {
        name: 'fieldId',
        type: 'string' as const,
        description: 'The data-field-id attribute value of the field to prefill',
        required: true,
      },
      {
        name: 'value',
        type: 'string' as const,
        description: 'The value to prefill',
        required: true,
      },
    ],
    handler: ({ fieldId, value }: { fieldId: string; value: string }) => {
      prefillField(fieldId, value)
      return { success: true, message: `Prefilled field: ${fieldId} with value: ${value}` }
    },
  })

  // Monitor CopilotKit messages for campaign structure generation
  useEffect(() => {
    if (visibleMessages.length === 0) return

    const actionResults = visibleMessages.filter((msg: DeprecatedGqlMessage): msg is ResultMessage => 
      typeof msg.isResultMessage === 'function' && msg.isResultMessage() && 
      msg.actionName === 'generateCampaignStrategy'
    )
    
    if (actionResults.length > 0) {
      const lastResult = actionResults[actionResults.length - 1]
      const decodedResult = ResultMessage.decodeResult(lastResult.result)
      let parsedResult = decodedResult
      if (typeof decodedResult === 'string') {
        try {
          parsedResult = JSON.parse(decodedResult)
        } catch (e) {
          console.error('Failed to parse decoded result string:', e)
        }
      }
      
      const resultKey = JSON.stringify(parsedResult)
      const currentKey = generatedStructure ? JSON.stringify(generatedStructure) : null
      
      if (resultKey !== currentKey) {
        try {
          // Validate structure (risk_notes transformation now handled by schema)
          const validated = CampaignStructureSchema.safeParse(parsedResult)
          
          if (validated.success) {
            setGeneratedStructure(validated.data)
            setProgressStage('done')
            toast.success('Kampány struktúra generálva!')
          } else {
            console.error('Validation Error:', validated.error)
            toast.error('Hiba: Érvénytelen AI kimenet. Kérlek próbáld újra.')
            setProgressStage('idle')
          }
        } catch (error) {
          console.error('Failed to parse campaign structure:', error)
          toast.error('Hiba: Nem sikerült feldolgozni az AI kimenetet.')
          setProgressStage('idle')
        }
      }
    }

    const executionMessages = visibleMessages.filter((msg: DeprecatedGqlMessage) => 
      typeof msg.isActionExecutionMessage === 'function' && 
      msg.isActionExecutionMessage()
    )
    
    // Check for normalizeCampaignBrief execution
    if (executionMessages.some((msg: any) => msg.name === 'normalizeCampaignBrief')) {
       if (progressStage === 'idle') setProgressStage('brief-normalizer')
    }

    // Check for generateCampaignStrategy execution
    if (executionMessages.some((msg: any) => msg.name === 'generateCampaignStrategy')) {
       if (progressStage === 'brief-normalizer') setProgressStage('strategy-designer')
    }
  }, [visibleMessages, generatedStructure, progressStage])

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Step 7 completed - start AI generation
      await handleGenerate()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleGenerate = async () => {
    if (!formData.description) {
      toast.error('Kérlek adj meg egy kampány leírást')
      return
    }

    setIsManualGenerating(true)
    setGeneratedStructure(null)
    setProgressStage('brief-normalizer')

    // Build brief from form data
    const brief = `${formData.description}\n\nKampány típusa: ${formData.type}\nCél: ${formData.goalType}\nElsődleges cél: ${formData.primaryGoal}`

    try {
      const response = await fetch('/api/ai/campaign-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          campaignType: formData.type,
          goalType: formData.goalType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate campaign structure')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is not readable')

      const decoder = new TextDecoder()
      let resultText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        resultText += decoder.decode(value, { stream: true })
      }
      
      // Clean up potential markdown code blocks
      let jsonContent = resultText.trim()
      if (jsonContent.startsWith('```')) {
        const lines = jsonContent.split('\n')
        if (lines[0].match(/^```(json)?$/) && lines[lines.length - 1].match(/^```$/)) {
          jsonContent = lines.slice(1, -1).join('\n')
        }
      }

      let structure
      try {
        // Try standard parse first
        structure = JSON.parse(jsonContent)
      } catch (e) {
        console.log('Standard JSON parse failed, attempting repair...')
        try {
          // Attempt to repair truncated JSON
          const repaired = jsonrepair(jsonContent)
          structure = JSON.parse(repaired)
          console.log('JSON repaired successfully')
        } catch (repairError) {
          console.error('JSON Repair Failed:', repairError)
        }
      }
      
      // Validate structure (risk_notes transformation now handled by schema)
      const validated = CampaignStructureSchema.safeParse(structure)
      if (validated.success) {
        setGeneratedStructure(validated.data)
        setProgressStage('done')
        toast.success('Kampány struktúra generálva!')
      } else {
        console.error('Validation Error:', validated.error)
        toast.error('Hiba: Érvénytelen AI kimenet. Kérlek próbáld újra.')
        setProgressStage('idle')
      }

    } catch (error) {
      console.error('Error generating campaign:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás során')
      setProgressStage('idle')
    } finally {
      setIsManualGenerating(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleChannel = (channel: string) => {
    const current = formData.channels
    if (current.includes(channel)) {
      updateField('channels', current.filter((c) => c !== channel))
    } else {
      updateField('channels', [...current, channel])
    }
  }

  // --- Step Components (same as CampaignWizard) ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1">
            Kampány Neve *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="mt-1"
            placeholder="pl. Őszi fenntarthatósági kampány"
            data-field-id="name"
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-sm font-semibold text-gray-700 mb-1">
            Kampány Típusa *
          </Label>
          <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
            <SelectTrigger className="mt-1" data-field-id="campaign_type">
              <SelectValue placeholder="Válassz típust..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="political_election">Politikai – választási</SelectItem>
              <SelectItem value="political_issue">
                Politikai – helyi ügy / issue kampány
              </SelectItem>
              <SelectItem value="brand_awareness">Márka – ismertségnövelő</SelectItem>
              <SelectItem value="brand_product">Márka – termékbevezetés</SelectItem>
              <SelectItem value="ngo">NGO – társadalmi ügy</SelectItem>
              <SelectItem value="other">Egyéb</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="startDate"
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              Kezdés Dátuma *
            </Label>
            <div className="relative mt-1">
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <Label
              htmlFor="endDate"
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              Befejezés Dátuma *
            </Label>
            <div className="relative mt-1">
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="geo" className="text-sm font-semibold text-gray-700 mb-1">
            Földrajzi fókusz
          </Label>
          <Input
            id="geo"
            type="text"
            value={formData.geo}
            onChange={(e) => updateField('geo', e.target.value)}
            className="mt-1"
            placeholder="pl. Budapest – VIII. kerület"
          />
        </div>

        <div>
          <Label
            htmlFor="description"
            className="text-sm font-semibold text-gray-700 mb-1"
          >
            Rövid leírás / kontextus
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Miről szól a kampány, miért most fut, kiket céloz nagyjából?"
            data-field-id="brief"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="primaryGoal"
            className="text-sm font-semibold text-gray-700 mb-1"
          >
            Elsődleges kampánycél
          </Label>
          <p className="text-xs text-gray-500 mb-2">
            Mi az az 1 dolog, amire a kampányt optimalizáljuk?
          </p>
          <Textarea
            id="primaryGoal"
            value={formData.primaryGoal}
            onChange={(e) => updateField('primaryGoal', e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="pl. 30 napon belül növeljük a márka ismertségét a 18–35-ös korosztálynál..."
          />
        </div>

        <div>
          <Label htmlFor="goalType" className="text-sm font-semibold text-gray-700 mb-1">
            Cél típusa
          </Label>
          <Select
            value={formData.goalType}
            onValueChange={(value) => updateField('goalType', value)}
          >
            <SelectTrigger className="mt-1" data-field-id="goal_type">
              <SelectValue placeholder="Válassz céltípust..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awareness">Ismertség (Awareness)</SelectItem>
              <SelectItem value="reach">Elérés / megjelenések</SelectItem>
              <SelectItem value="engagement">Elköteleződés (Engagement)</SelectItem>
              <SelectItem value="leads">Listaépítés / feliratkozás</SelectItem>
              <SelectItem value="conversion">Konverzió / vásárlás / adomány</SelectItem>
              <SelectItem value="mobilization">Mobilizálás (részvétel, szavazás)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TagInput
          label="Másodlagos célok"
          placeholder="pl. hírlevél-lista bővítése, több DM üzenet (Enter az hozzáadáshoz)"
          tags={formData.secondaryGoals}
          onChange={(tags) => updateField('secondaryGoals', tags)}
        />

        <div>
          <Label htmlFor="nonGoals" className="text-sm font-semibold text-gray-700 mb-1">
            Mi NEM cél?
          </Label>
          <Textarea
            id="nonGoals"
            value={formData.nonGoals}
            onChange={(e) => updateField('nonGoals', e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="pl. Nem cél a közvetlen értékesítés, csak edukáció..."
          />
          <p className="text-xs text-gray-500 mt-1">Ez segít az AI-nak fókuszálni.</p>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="identity" className="text-sm font-semibold text-gray-700 mb-1">
            Ki vagyunk mi?
          </Label>
          <Textarea
            id="identity"
            value={formData.identity}
            onChange={(e) => updateField('identity', e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="Rövid leírás a márkáról, jelöltről vagy szervezetről."
          />
        </div>

        <div>
          <Label
            htmlFor="positioning"
            className="text-sm font-semibold text-gray-700 mb-1"
          >
            Pozicionálás röviden
          </Label>
          <Textarea
            id="positioning"
            value={formData.positioning}
            onChange={(e) => updateField('positioning', e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="pl. Fiatal, digitálisan nyitott, vidék iránt elkötelezett..."
          />
        </div>

        <TagInput
          label="Fő erősségek / USP-k"
          placeholder="pl. egyedi receptúrák, helyi kötődés (Enter az hozzáadáshoz)"
          tags={formData.usps}
          onChange={(tags) => updateField('usps', tags)}
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <TagInput
          label="Elsődleges célcsoport(ok)"
          placeholder="pl. Fiatal városi dolgozók 20-35 (Enter az hozzáadáshoz)"
          tags={formData.targetTags}
          onChange={(tags) => updateField('targetTags', tags)}
          help="Adj meg rövid címkéket az AI számára."
        />

        <div>
          <Label
            htmlFor="existingPersonas"
            className="text-sm font-semibold text-gray-700 mb-1"
          >
            Meglévő personák (opcionális)
          </Label>
          <Textarea
            id="existingPersonas"
            value={formData.existingPersonas}
            onChange={(e) => updateField('existingPersonas', e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="Ha vannak kidolgozott personák, itt bemásolhatod a leírásukat."
          />
        </div>

        <div>
          <Label htmlFor="attitudes" className="text-sm font-semibold text-gray-700 mb-1">
            Fontos attitűdök / hozzáállások
          </Label>
          <Textarea
            id="attitudes"
            value={formData.attitudes}
            onChange={(e) => updateField('attitudes', e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="pl. bizalmatlan a politikával szemben, árérzékeny, de minőséget szeretne..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Milyen érzelmi, bizalmi viszonyban vannak a témával?
          </p>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <TagInput
          label="Mit szeretnénk hangsúlyozni?"
          placeholder="pl. fenntarthatóság konkrét előnyökkel (Enter az hozzáadáshoz)"
          tags={formData.messages}
          onChange={(tags) => updateField('messages', tags)}
        />

        <TagInput
          label="Tabuk / kerülendő témák"
          placeholder="pl. országos pártpolitika, árverseny (Enter az hozzáadáshoz)"
          tags={formData.taboos}
          onChange={(tags) => updateField('taboos', tags)}
        />

        <div>
          <Label htmlFor="motifs" className="text-sm font-semibold text-gray-700 mb-1">
            Kötelező keretek / motívumok
          </Label>
          <Textarea
            id="motifs"
            value={formData.motifs}
            onChange={(e) => updateField('motifs', e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="pl. mindig hangsúlyozzuk a helyi kötődést..."
          />
        </div>

        <div>
          <Label htmlFor="tone" className="text-sm font-semibold text-gray-700 mb-1">
            Elvárt tónus / hangnem
          </Label>
          <Select value={formData.tone} onValueChange={(value) => updateField('tone', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Válassz tónust..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Tegező, közvetlen</SelectItem>
              <SelectItem value="professional">Magázó, professzionális</SelectItem>
              <SelectItem value="humorous">Humoros, könnyed</SelectItem>
              <SelectItem value="serious">Komoly, felelősségteljes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep6 = () => {
    const channelOptions = [
      'Facebook Organic',
      'Facebook Ads',
      'Instagram Feed',
      'Instagram Story/Reels',
      'TikTok',
      'YouTube',
      'Hírlevél',
      'Weboldal/Landing',
      'Offline',
    ]

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Fő csatornák
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {channelOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => toggleChannel(option)}
                  className={`
                    cursor-pointer px-3 py-2 rounded-lg border text-sm font-medium transition-all text-center select-none
                    ${
                      formData.channels.includes(option)
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <TagInput
            label="Biztosan NEM használt csatornák"
            placeholder="pl. Twitter/X (Enter az hozzáadáshoz)"
            tags={formData.excludedChannels}
            onChange={(tags) => updateField('excludedChannels', tags)}
          />

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Költségkeret szintje
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              {['low', 'medium', 'high'].map((level) => (
                <label key={level} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="budget"
                    value={level}
                    checked={formData.budget === level}
                    onChange={(e) => updateField('budget', e.target.value)}
                    className="sr-only peer"
                  />
                  <div className="p-3 text-center rounded-lg border border-gray-200 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 text-gray-600 hover:bg-gray-50 transition-all">
                    {level === 'low' && 'Alacsony (Organikus)'}
                    {level === 'medium' && 'Közepes (Hybrid)'}
                    {level === 'high' && 'Magas (Paid)'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="constraints" className="text-sm font-semibold text-gray-700 mb-1">
              Erőforrás limitációk
            </Label>
            <Textarea
              id="constraints"
              value={formData.constraints}
              onChange={(e) => updateField('constraints', e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="pl. Nincs videósunk, kevés idő kreatív gyártásra..."
            />
          </div>
        </div>
      </div>
    )
  }

  const renderStep7 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="historyWorked" className="text-sm font-semibold text-gray-700 mb-1">
            Mi működött korábban?
          </Label>
          <Textarea
            id="historyWorked"
            value={formData.historyWorked}
            onChange={(e) => updateField('historyWorked', e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="pl. Hiteles arcokkal készült rövid videók, helyi sztorik..."
          />
        </div>

        <div>
          <Label htmlFor="historyFailed" className="text-sm font-semibold text-gray-700 mb-1">
            Mi bukott el / nem működött?
          </Label>
          <Textarea
            id="historyFailed"
            value={formData.historyFailed}
            onChange={(e) => updateField('historyFailed', e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="pl. Száraz statisztikás posztok, túl általános üzenetek..."
          />
        </div>

        <div>
          <Label htmlFor="references" className="text-sm font-semibold text-gray-700 mb-1">
            Referenciakampányok (URL vagy leírás)
          </Label>
          <Input
            id="references"
            type="text"
            value={formData.references}
            onChange={(e) => updateField('references', e.target.value)}
            className="mt-1"
            placeholder="pl. X márka őszi megújulás kampánya"
          />
        </div>

        <div>
          <Label htmlFor="legal" className="text-sm font-semibold text-gray-700 mb-1">
            Jog / reputáció / korlátok
          </Label>
          <Textarea
            id="legal"
            value={formData.legal}
            onChange={(e) => updateField('legal', e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="pl. Adatkezelési megkötések, nem mehetünk bele negatív kampányba..."
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar: Stepper */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 sticky top-6">
            <div className="mb-6">
              <Link href="/campaigns">
                <button className="self-start flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-primary-600 transition-all mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Vissza a kampányokhoz
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900">
                  Kampány Tervező AI
                </h2>
              </div>
            </div>
            <div className="space-y-0 relative">
              {/* Connector Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100 z-0"></div>

              {steps.map((step) => {
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep

                return (
                  <div
                    key={step.id}
                    className="relative z-10 flex items-start gap-4 pb-6 last:pb-0"
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                        ${
                          isActive
                            ? 'bg-primary-600 border-primary-600 text-white shadow-glow'
                            : isCompleted
                              ? 'bg-primary-50 border-primary-200 text-primary-600'
                              : 'bg-white border-gray-200 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="pt-1">
                      <h3
                        className={`text-sm font-bold transition-colors ${
                          isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Save Button - Always visible at bottom of sidebar */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={handleSaveWizard}
                disabled={isSaving || isGenerating || !formData.name || !formData.type || !formData.startDate || !formData.endDate || !formData.goalType}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mentés...
                  </>
                ) : (
                  <>
                    Mentés
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content: Form Steps */}
        <div className="flex-1 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-10 flex flex-col min-h-[600px]">
            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-500 mb-8 border-b border-gray-100 pb-4">
                Lépés {currentStep} / {totalSteps}: {steps[currentStep - 1].desc}
              </p>

              {/* Dynamic Step Rendering */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              {currentStep === 6 && renderStep6()}
              {currentStep === 7 && renderStep7()}

              {/* Generated Structure Preview */}
              {generatedStructure && (
                <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CampaignStructurePreview
                    structure={generatedStructure}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </div>
              )}

              {/* Loading Indicator */}
              {(isGenerating || isManualGenerating) && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <div className="flex gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          progressStage === 'brief-normalizer' ||
                          progressStage === 'strategy-designer' ||
                          progressStage === 'done'
                            ? 'bg-primary-600'
                            : 'bg-gray-300'
                        }`}
                      />
                      <div
                        className={`h-2 w-2 rounded-full ${
                          progressStage === 'strategy-designer' || progressStage === 'done'
                            ? 'bg-primary-600'
                            : 'bg-gray-300'
                        }`}
                      />
                      <div
                        className={`h-2 w-2 rounded-full ${
                          progressStage === 'done' ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <span>
                      {progressStage === 'brief-normalizer' && 'Brief Normalizer'}
                      {progressStage === 'strategy-designer' && 'Strategy Designer'}
                      {progressStage === 'done' && 'Kész'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`
                  px-6 py-2.5 rounded-xl font-medium text-sm transition-all
                  ${
                    currentStep === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                Vissza
              </button>
              {currentStep === totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={isGenerating || isManualGenerating || isSaving}
                  className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all flex items-center gap-2"
                >
                  {(isGenerating || isManualGenerating) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {progressStage === 'brief-normalizer' && 'Brief elemzése...'}
                      {progressStage === 'strategy-designer' && 'Stratégia tervezése...'}
                      {progressStage === 'done' && 'Kész!'}
                      {progressStage === 'idle' && 'Generálás folyamatban...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Kampány Struktúra Generálása
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isGenerating}
                  className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all flex items-center gap-2"
                >
                  Következő
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
