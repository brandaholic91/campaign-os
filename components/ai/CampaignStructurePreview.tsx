'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Edit2, Save } from 'lucide-react'

interface StructureItem {
  id?: string
  title?: string
  name?: string
  description: string
  priority?: number
  selected?: boolean
}

interface CampaignStructure {
  goals: StructureItem[]
  segments: StructureItem[]
  topics: StructureItem[]
  narratives: StructureItem[]
}

interface CampaignStructurePreviewProps {
  structure: CampaignStructure
  onSave: (structure: CampaignStructure) => void
  isSaving: boolean
}

export function CampaignStructurePreview({ structure: initialStructure, onSave, isSaving }: CampaignStructurePreviewProps) {
  const [structure, setStructure] = useState(initialStructure)
  const [editingItem, setEditingItem] = useState<{ section: keyof CampaignStructure, index: number } | null>(null)
  const [editValues, setEditValues] = useState<StructureItem | null>(null)

  const sections: { key: keyof CampaignStructure; label: string }[] = [
    { key: 'goals', label: 'Célok' },
    { key: 'segments', label: 'Célcsoportok' },
    { key: 'topics', label: 'Témák' },
    { key: 'narratives', label: 'Narratívák' }
  ]

  const toggleSelection = (section: keyof CampaignStructure, index: number) => {
    const newStructure = { ...structure }
    // Initialize selected if undefined (default to true usually, but here we toggle)
    const isSelected = newStructure[section][index].selected !== false
    newStructure[section][index].selected = !isSelected
    setStructure(newStructure)
  }

  const startEditing = (section: keyof CampaignStructure, index: number) => {
    setEditingItem({ section, index })
    setEditValues({ ...structure[section][index] })
  }

  const saveEdit = () => {
    if (!editingItem || !editValues) return

    const newStructure = { ...structure }
    newStructure[editingItem.section][editingItem.index] = editValues
    setStructure(newStructure)
    setEditingItem(null)
    setEditValues(null)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditValues(null)
  }

  const handleSaveSelected = () => {
    const selectedStructure = {
      goals: structure.goals.filter(i => i.selected !== false),
      segments: structure.segments.filter(i => i.selected !== false),
      topics: structure.topics.filter(i => i.selected !== false),
      narratives: structure.narratives.filter(i => i.selected !== false)
    }
    onSave(selectedStructure)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generált Struktúra</h2>
        <Button onClick={handleSaveSelected} disabled={isSaving}>
          {isSaving ? (
            <>Mentés...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Kiválasztottak Mentése
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {sections.map(section => (
            <TabsTrigger key={section.key} value={section.key}>
              {section.label}
              <Badge variant="secondary" className="ml-2">
                {structure[section.key].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(section => (
          <TabsContent key={section.key} value={section.key} className="mt-6">
            <div className="grid gap-4">
              {structure[section.key].map((item, index) => (
                <Card key={index} className={`relative transition-colors ${item.selected === false ? 'opacity-60 bg-muted' : 'border-primary/50'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={item.selected !== false}
                          onCheckedChange={() => toggleSelection(section.key, index)}
                        />
                        {editingItem?.section === section.key && editingItem?.index === index ? (
                          <Input 
                            value={editValues?.title || editValues?.name || ''}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, [item.title ? 'title' : 'name']: e.target.value } : null)}
                            className="font-semibold"
                          />
                        ) : (
                          <CardTitle className="text-lg">
                            {item.title || item.name}
                          </CardTitle>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingItem?.section === section.key && editingItem?.index === index ? (
                          <>
                            <Button size="icon" variant="ghost" onClick={saveEdit}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEdit}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => startEditing(section.key, index)}>
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingItem?.section === section.key && editingItem?.index === index ? (
                      <Textarea 
                        value={editValues?.description || ''}
                        onChange={(e) => setEditValues(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="mt-2"
                      />
                    ) : (
                      <p className="text-muted-foreground">{item.description}</p>
                    )}
                    {item.priority && (
                      <div className="mt-2">
                        <Badge variant="outline">Prioritás: {item.priority}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
