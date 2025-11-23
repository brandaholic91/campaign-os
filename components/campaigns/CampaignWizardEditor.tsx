'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CampaignStructureSchema } from '@/lib/ai/schemas'
import { jsonrepair } from 'jsonrepair'
import { CampaignStructurePreview } from '@/components/ai/CampaignStructurePreview'
import type { CampaignStructure as CampaignStructureType } from '@/lib/ai/schemas'

// Helper function to convert CampaignStructureType to the format expected by CampaignStructurePreview
function convertStructureForPreview(structure: CampaignStructureType): any {
  return {
    goals: structure.goals.map(goal => ({
      title: goal.title,
      description: goal.description || '',
      priority: goal.priority,
      selected: true
    })),
    segments: structure.segments.map(segment => ({
      name: segment.name,
      description: segment.description || '',
      priority: segment.priority,
      selected: true
    })),
    topics: structure.topics.map(topic => ({
      name: topic.name,
      description: topic.description || '',
      priority: topic.priority,
      selected: true
    })),
    narratives: (structure.narratives || []).map(narrative => ({
      title: narrative.title,
      description: narrative.description,
      priority: narrative.priority || 1,
      selected: true
    })),
    segment_topic_matrix: structure.segment_topic_matrix || []
  }
}

// Helper function to convert preview structure back to CampaignStructureType
function convertPreviewToStructure(previewStructure: any, originalStructure: CampaignStructureType): CampaignStructureType {
  // Find original goals by title
  const originalGoals = originalStructure.goals || []
  const originalSegments = originalStructure.segments || []
  const originalTopics = originalStructure.topics || []
  const originalNarratives = originalStructure.narratives || []

  return {
    goals: previewStructure.goals.map((previewGoal: any) => {
      const original = originalGoals.find(g => g.title === previewGoal.title)
      return original || {
        title: previewGoal.title,
        description: previewGoal.description,
        priority: typeof previewGoal.priority === 'number' ? previewGoal.priority : 1
      }
    }),
    segments: previewStructure.segments.map((previewSegment: any) => {
      const original = originalSegments.find(s => s.name === previewSegment.name)
      return original || {
        name: previewSegment.name,
        description: previewSegment.description,
        priority: previewSegment.priority || 'secondary'
      }
    }),
    topics: previewStructure.topics.map((previewTopic: any) => {
      const original = originalTopics.find(t => t.name === previewTopic.name)
      return original || {
        name: previewTopic.name,
        description: previewTopic.description,
        priority: previewTopic.priority || 'secondary'
      }
    }),
    narratives: previewStructure.narratives.map((previewNarrative: any) => {
      const original = originalNarratives.find(n => n.title === previewNarrative.title)
      return original || {
        title: previewNarrative.title,
        description: previewNarrative.description,
        priority: typeof previewNarrative.priority === 'number' ? previewNarrative.priority : 1
      }
    }),
    segment_topic_matrix: previewStructure.segment_topic_matrix || []
  }
}

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

interface CampaignWizardEditorProps {
  wizardData: any
  campaignId: string
  campaignType: string
  goalType: string
  onUpdate?: () => void
}

export function CampaignWizardEditor({ wizardData, campaignId, campaignType, goalType, onUpdate }: CampaignWizardEditorProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(wizardData || {})
  const [generatedStructure, setGeneratedStructure] = useState<CampaignStructureType | null>(null)

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const toggleChannel = (channel: string) => {
    const current = formData.channels || []
    if (current.includes(channel)) {
      updateField('channels', current.filter((c: string) => c !== channel))
    } else {
      updateField('channels', [...current, channel])
    }
  }

  const handleGenerateStructure = async () => {
    if (!formData.description) {
      toast.error('Kérlek adj meg egy kampány leírást')
      return
    }

    setIsGenerating(true)
    try {
      // Build brief from form data
      const brief = `${formData.description}\n\nKampány típusa: ${formData.type || campaignType}\nCél: ${formData.goalType || goalType}\nElsődleges cél: ${formData.primaryGoal || ''}`

      const response = await fetch('/api/ai/campaign-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          campaignType: formData.type || campaignType,
          goalType: formData.goalType || goalType
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
        structure = JSON.parse(jsonContent)
      } catch (e) {
        console.log('Standard JSON parse failed, attempting repair...')
        try {
          const repaired = jsonrepair(jsonContent)
          structure = JSON.parse(repaired)
          console.log('JSON repaired successfully')
        } catch (repairError) {
          console.error('JSON Repair Failed:', repairError)
          throw new Error('A generálás megszakadt és nem sikerült helyreállítani. Kérlek próbáld újra.')
        }
      }
      
      // Validate structure
      const validated = CampaignStructureSchema.safeParse(structure)
      if (!validated.success) {
        console.error('Validation Error:', validated.error)
        toast.error('Hiba: Érvénytelen AI kimenet. Kérlek próbáld újra.')
        return
      }

      // Store generated structure for preview instead of saving immediately
      setGeneratedStructure(validated.data)
      toast.success('Kampány struktúra generálva! Válaszd ki, mit szeretnél megtartani.')
    } catch (error) {
      console.error('Error generating campaign:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás során')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveWizardData = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wizard_data: formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save wizard data')
      }

      toast.success('Wizard adatok sikeresen mentve!')
      router.refresh()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error saving wizard data:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a mentés során')
    }
  }

  const handleSaveStructure = async (previewStructure: any) => {
    if (!generatedStructure) return
    
    setIsSaving(true)
    try {
      // Convert preview structure back to CampaignStructureType
      const structure = convertPreviewToStructure(previewStructure, generatedStructure)
      
      const saveResponse = await fetch('/api/campaigns/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignId, // Include campaignId to update existing campaign
          campaign: {
            name: formData.name || '',
            description: formData.description || '',
            startDate: formData.startDate || '',
            endDate: formData.endDate || '',
            campaignType: formData.type || campaignType,
            goalType: formData.goalType || goalType
          },
          structure,
          wizardData: formData // Include wizard data to preserve it
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Failed to save campaign structure')
      }

      toast.success('Kampány struktúra sikeresen mentve!')
      setGeneratedStructure(null) // Clear preview after save
      router.refresh()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error saving campaign structure:', error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a mentés során')
    } finally {
      setIsSaving(false)
    }
  }

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
      {generatedStructure ? (
        <CampaignStructurePreview
          structure={convertStructureForPreview(generatedStructure)}
          onSave={handleSaveStructure}
          isSaving={isSaving}
          campaignId={campaignId}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Kampány Tervező Adatok</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveWizardData}
                variant="outline"
                className="px-4 py-2"
              >
                Mentés
              </Button>
              <Button
                onClick={handleGenerateStructure}
                disabled={isGenerating}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generálás...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Kampánystruktúra újragenerálása
                  </>
                )}
              </Button>
            </div>
          </div>

      {/* Step 1: Alapadatok */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">1. Alapadatok</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Kampány Neve</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Kampány neve"
            />
          </div>
          <div>
            <Label>Kampány Típusa</Label>
            <Input value={formData.type || ''} disabled />
          </div>
          <div>
            <Label>Kezdési Dátum</Label>
            <Input
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => updateField('startDate', e.target.value)}
            />
          </div>
          <div>
            <Label>Befejezési Dátum</Label>
            <Input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => updateField('endDate', e.target.value)}
            />
          </div>
          <div>
            <Label>Földrajzi fókusz</Label>
            <Input
              value={formData.geo || ''}
              onChange={(e) => updateField('geo', e.target.value)}
              placeholder="pl. Budapest – VIII. kerület"
            />
          </div>
        </div>
        <div>
          <Label>Rövid leírás / kontextus</Label>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            placeholder="Miről szól a kampány, miért most fut, kiket céloz nagyjából?"
          />
        </div>
      </div>

      {/* Step 2: Célok */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">2. Célok</h4>
        <div>
          <Label>Elsődleges kampánycél</Label>
          <Textarea
            value={formData.primaryGoal || ''}
            onChange={(e) => updateField('primaryGoal', e.target.value)}
            rows={2}
            placeholder="pl. 30 napon belül növeljük a márka ismertségét..."
          />
        </div>
        <div>
          <Label>Cél típusa</Label>
          <Input value={formData.goalType || ''} disabled />
        </div>
        <TagInput
          label="Másodlagos célok"
          placeholder="Másodlagos cél hozzáadása (Enter)"
          tags={formData.secondaryGoals || []}
          onChange={(tags) => updateField('secondaryGoals', tags)}
        />
        <div>
          <Label>Mi NEM cél?</Label>
          <Textarea
            value={formData.nonGoals || ''}
            onChange={(e) => updateField('nonGoals', e.target.value)}
            rows={2}
            placeholder="pl. Nem cél a közvetlen értékesítés..."
          />
        </div>
      </div>

      {/* Step 3: Identitás */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">3. Identitás</h4>
        <div>
          <Label>Ki vagyunk mi?</Label>
          <Textarea
            value={formData.identity || ''}
            onChange={(e) => updateField('identity', e.target.value)}
            rows={3}
            placeholder="Rövid leírás a márkáról, jelöltről vagy szervezetről."
          />
        </div>
        <div>
          <Label>Pozicionálás röviden</Label>
          <Textarea
            value={formData.positioning || ''}
            onChange={(e) => updateField('positioning', e.target.value)}
            rows={2}
            placeholder="pl. Fiatal, digitálisan nyitott..."
          />
        </div>
        <TagInput
          label="Fő erősségek / USP-k"
          placeholder="USP hozzáadása (Enter)"
          tags={formData.usps || []}
          onChange={(tags) => updateField('usps', tags)}
        />
      </div>

      {/* Step 4: Célcsoport */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">4. Célcsoport</h4>
        <TagInput
          label="Elsődleges célcsoport(ok)"
          placeholder="Célcsoport hozzáadása (Enter)"
          tags={formData.targetTags || []}
          onChange={(tags) => updateField('targetTags', tags)}
        />
        <div>
          <Label>Meglévő personák (opcionális)</Label>
          <Textarea
            value={formData.existingPersonas || ''}
            onChange={(e) => updateField('existingPersonas', e.target.value)}
            rows={3}
            placeholder="Ha vannak kidolgozott personák..."
          />
        </div>
        <div>
          <Label>Fontos attitűdök / hozzáállások</Label>
          <Textarea
            value={formData.attitudes || ''}
            onChange={(e) => updateField('attitudes', e.target.value)}
            rows={3}
            placeholder="pl. bizalmatlan a politikával szemben..."
          />
        </div>
      </div>

      {/* Step 5: Üzenetek */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">5. Üzenetek</h4>
        <TagInput
          label="Mit szeretnénk hangsúlyozni?"
          placeholder="Üzenet hozzáadása (Enter)"
          tags={formData.messages || []}
          onChange={(tags) => updateField('messages', tags)}
        />
        <TagInput
          label="Tabuk / kerülendő témák"
          placeholder="Tabu hozzáadása (Enter)"
          tags={formData.taboos || []}
          onChange={(tags) => updateField('taboos', tags)}
        />
        <div>
          <Label>Kötelező keretek / motívumok</Label>
          <Textarea
            value={formData.motifs || ''}
            onChange={(e) => updateField('motifs', e.target.value)}
            rows={2}
            placeholder="pl. mindig hangsúlyozzuk a helyi kötődést..."
          />
        </div>
        <div>
          <Label>Elvárt tónus / hangnem</Label>
          <Select value={formData.tone || ''} onValueChange={(value) => updateField('tone', value)}>
            <SelectTrigger>
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

      {/* Step 6: Erőforrások */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">6. Erőforrások</h4>
        <div>
          <Label className="mb-3 block">Fő csatornák</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {channelOptions.map((option) => (
              <div
                key={option}
                onClick={() => toggleChannel(option)}
                className={`
                  cursor-pointer px-3 py-2 rounded-lg border text-sm font-medium transition-all text-center select-none
                  ${
                    (formData.channels || []).includes(option)
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
          placeholder="Kizárt csatorna hozzáadása (Enter)"
          tags={formData.excludedChannels || []}
          onChange={(tags) => updateField('excludedChannels', tags)}
        />
        <div>
          <Label>Költségkeret szintje</Label>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
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
          <Label>Erőforrás limitációk</Label>
          <Textarea
            value={formData.constraints || ''}
            onChange={(e) => updateField('constraints', e.target.value)}
            rows={2}
            placeholder="pl. Nincs videósunk, kevés idő kreatív gyártásra..."
          />
        </div>
      </div>

      {/* Step 7: Kontextus */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-gray-900">7. Kontextus</h4>
        <div>
          <Label>Mi működött korábban?</Label>
          <Textarea
            value={formData.historyWorked || ''}
            onChange={(e) => updateField('historyWorked', e.target.value)}
            rows={3}
            placeholder="pl. Hiteles arcokkal készült rövid videók..."
          />
        </div>
        <div>
          <Label>Mi bukott el / nem működött?</Label>
          <Textarea
            value={formData.historyFailed || ''}
            onChange={(e) => updateField('historyFailed', e.target.value)}
            rows={3}
            placeholder="pl. Száraz statisztikás posztok..."
          />
        </div>
        <div>
          <Label>Referenciakampányok (URL vagy leírás)</Label>
          <Input
            value={formData.references || ''}
            onChange={(e) => updateField('references', e.target.value)}
            placeholder="pl. X márka őszi megújulás kampánya"
          />
        </div>
        <div>
          <Label>Jog / reputáció / korlátok</Label>
          <Textarea
            value={formData.legal || ''}
            onChange={(e) => updateField('legal', e.target.value)}
            rows={2}
            placeholder="pl. Adatkezelési megkötések..."
          />
        </div>
      </div>
        </>
      )}
    </div>
  )
}

