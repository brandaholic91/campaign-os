'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CampaignStructurePreview } from '@/components/ai/CampaignStructurePreview'
import { toast } from 'sonner'
import { useCopilotAction, useCopilotReadable, useCopilotChat } from '@copilotkit/react-core'
import { TextMessage, Role as MessageRole, ResultMessage, Message as DeprecatedGqlMessage } from '@copilotkit/runtime-client-gql'
import { highlightField, prefillField } from '@/lib/ai/copilotkit/tools'
import { CampaignStructureSchema } from '@/lib/ai/schemas'

export default function CampaignAIPage() {
  const [brief, setBrief] = useState('')
  const [campaignType, setCampaignType] = useState('')
  const [goalType, setGoalType] = useState('')
  const [generatedStructure, setGeneratedStructure] = useState<any>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [isSaving, setIsSaving] = useState(false)
  const [progressStage, setProgressStage] = useState<'idle' | 'brief-normalizer' | 'strategy-designer' | 'done'>('idle')

  // CopilotKit chat for streaming
  const { appendMessage, isLoading: isGenerating, stopGeneration, visibleMessages } = useCopilotChat({
    id: 'campaign-ai-generation'
  })

  const handleSave = async (structure: any) => {
    if (!name) {
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
            name,
            description: brief,
            startDate,
            endDate,
            campaignType,
            goalType
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

  // Expose form state to CopilotKit agent
  useCopilotReadable(
    {
      description: 'Campaign AI form state including brief, campaign type, goal type, and basic campaign info',
      value: {
        brief,
        campaign_type: campaignType,
        goal_type: goalType,
        name,
        start_date: startDate,
        end_date: endDate,
      },
    },
    [brief, campaignType, goalType, name, startDate, endDate]
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

  // Monitor CopilotKit messages for campaign structure generation from action results
  useEffect(() => {
    if (visibleMessages.length === 0) return

    // Check visibleMessages for action execution results (ResultMessage)
    const actionResults = visibleMessages.filter((msg: DeprecatedGqlMessage): msg is ResultMessage => 
      typeof msg.isResultMessage === 'function' && msg.isResultMessage() && 
      msg.actionName === 'generateCampaignStructure'
    )
    
    if (actionResults.length > 0) {
      const lastResult = actionResults[actionResults.length - 1]
      
      // Only process if we haven't already processed this result
      const decodedResult = ResultMessage.decodeResult(lastResult.result)
      const resultKey = JSON.stringify(decodedResult)
      const currentKey = generatedStructure ? JSON.stringify(generatedStructure) : null
      
      if (resultKey !== currentKey) {
        try {
          // Decode the result using ResultMessage.decodeResult
          const validated = CampaignStructureSchema.safeParse(decodedResult)
          
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
          console.error('Failed to parse campaign structure from action result:', error)
          toast.error('Hiba: Nem sikerült feldolgozni az AI kimenetet.')
          setProgressStage('idle')
        }
      }
    }

    // Update progress based on action execution messages
    const executionMessages = visibleMessages.filter((msg: DeprecatedGqlMessage) => 
      typeof msg.isActionExecutionMessage === 'function' && 
      msg.isActionExecutionMessage() && 
      (msg as any).name === 'generateCampaignStructure'
    )
    
    if (executionMessages.length > 0 && progressStage === 'brief-normalizer') {
      setProgressStage('strategy-designer')
    }
  }, [visibleMessages, generatedStructure, progressStage])

  const handleGenerate = async () => {
    if (!brief) {
      toast.error('Kérlek adj meg egy kampány leírást')
      return
    }

    setGeneratedStructure(null)
    setProgressStage('brief-normalizer')

    // Send message to CopilotKit agent to generate campaign structure
    // The AI will call the generateCampaignStructure backend action
    const userMessage = new TextMessage({
      role: MessageRole.User,
      content: JSON.stringify({
        command: 'generate_campaign_structure',
        brief,
        campaignType: campaignType || undefined,
        goalType: goalType || undefined,
      }),
    })

    try {
      await appendMessage(userMessage, { followUp: true })
      // Progress will be updated via useEffect when ResultMessage is received
    } catch (error) {
      console.error('Error sending message to CopilotKit:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás indításakor')
      setProgressStage('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/campaigns">
            <button className="self-start flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-primary-600 transition-all mb-4">
              <ArrowLeft className="w-4 h-4" />
              Vissza a kampányokhoz
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Kampány Tervező AI</h1>
              <p className="text-gray-500 mt-1">
                Írd le a kampányod célját, és az AI segít felépíteni a struktúrát
              </p>
            </div>
          </div>
        </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Kampány Adatok</CardTitle>
            <CardDescription>
              Add meg a kampány alapvető adatait és a briefet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Kampány Neve</Label>
              <Input 
                placeholder="pl. Tavaszi Kollekció Bevezetés" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-field-id="name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Kezdés Dátuma</Label>
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Befejezés Dátuma</Label>
                <Input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Kampány Típusa</Label>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger data-field-id="campaign_type">
                    <SelectValue placeholder="Válassz típust" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand_awareness">Márkaismertség</SelectItem>
                    <SelectItem value="product_launch">Termékbevezetés</SelectItem>
                    <SelectItem value="political_election">Választási kampány</SelectItem>
                    <SelectItem value="political_issue">Ügy alapú kampány</SelectItem>
                    <SelectItem value="ngo_issue">Civil ügy</SelectItem>
                    <SelectItem value="promo">Promóció</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Elsődleges Cél</Label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger data-field-id="goal_type">
                    <SelectValue placeholder="Válassz célt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Ismertség növelés</SelectItem>
                    <SelectItem value="engagement">Elköteleződés</SelectItem>
                    <SelectItem value="conversion">Konverzió</SelectItem>
                    <SelectItem value="list_building">Listaépítés</SelectItem>
                    <SelectItem value="mobilization">Mozgósítás</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kampány Leírása (Brief)</Label>
              <Textarea 
                placeholder="Írd le részletesen, miről szól a kampány, kiket szeretnél elérni, és mi a fő üzenet..."
                className="min-h-[200px] text-base resize-y"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                data-field-id="brief"
              />
              <p className="text-xs text-muted-foreground">
                Minél részletesebb a leírás, annál pontosabb lesz az AI javaslata.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full md:w-auto" 
                size="lg" 
                onClick={handleGenerate}
                disabled={isGenerating || !brief}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {progressStage === 'brief-normalizer' && 'Brief elemzése...'}
                    {progressStage === 'strategy-designer' && 'Stratégia tervezése...'}
                    {progressStage === 'done' && 'Kész!'}
                    {progressStage === 'idle' && 'Generálás folyamatban...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Kampány Struktúra Generálása
                  </>
                )}
              </Button>
              {isGenerating && progressStage !== 'idle' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className={`h-2 w-2 rounded-full ${progressStage === 'brief-normalizer' || progressStage === 'strategy-designer' || progressStage === 'done' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 w-2 rounded-full ${progressStage === 'strategy-designer' || progressStage === 'done' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 w-2 rounded-full ${progressStage === 'done' ? 'bg-primary' : 'bg-muted'}`} />
                  </div>
                  <span>
                    {progressStage === 'brief-normalizer' && 'Brief Normalizer'}
                    {progressStage === 'strategy-designer' && 'Strategy Designer'}
                    {progressStage === 'done' && 'Kész'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {generatedStructure && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CampaignStructurePreview 
              structure={generatedStructure} 
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
