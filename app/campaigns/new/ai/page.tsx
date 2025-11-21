'use client'

import { useState } from 'react'
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

export default function CampaignAIPage() {
  const [brief, setBrief] = useState('')
  const [campaignType, setCampaignType] = useState('')
  const [goalType, setGoalType] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStructure, setGeneratedStructure] = useState<any>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [isSaving, setIsSaving] = useState(false)

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

  const handleGenerate = async () => {
    if (!brief) {
      toast.error('Kérlek adj meg egy kampány leírást')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/campaign-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brief,
          campaignType: campaignType || undefined,
          goalType: goalType || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate campaign')
      }

      const data = await response.json()
      setGeneratedStructure(data)
      toast.success('Kampány struktúra generálva!')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás során')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Vissza a kampányokhoz
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kampány Tervező AI</h1>
            <p className="text-muted-foreground mt-1">
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
              />
              <p className="text-xs text-muted-foreground">
                Minél részletesebb a leírás, annál pontosabb lesz az AI javaslata.
              </p>
            </div>

            <Button 
              className="w-full md:w-auto" 
              size="lg" 
              onClick={handleGenerate}
              disabled={isGenerating || !brief}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generálás folyamatban...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Kampány Struktúra Generálása
                </>
              )}
            </Button>
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
  )
}
