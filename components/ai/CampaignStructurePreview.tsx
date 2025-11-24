'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Edit2, Save } from 'lucide-react'
import { ValidationStatusIcon, type ValidationStatus } from '@/components/ui/ValidationStatusIcon'
import { SegmentTopicMatrixEditor } from './SegmentTopicMatrixEditor'
import type { ExecutionReadinessResult } from '@/lib/validation/campaign-structure'

interface StructureItem {
  id?: string
  title?: string
  name?: string
  description: string
  priority?: number | string
  selected?: boolean
}

type MatrixEntry = {
  segment_index: number
  topic_index: number
  importance: 'high' | 'medium' | 'low'
  role: 'core_message' | 'support' | 'experimental'
  summary?: string
}

interface CampaignStructure {
  goals: StructureItem[]
  segments: StructureItem[]
  topics: StructureItem[]
  narratives: StructureItem[]
  segment_topic_matrix?: MatrixEntry[]
}

interface CampaignStructurePreviewProps {
  structure: CampaignStructure
  onSave: (structure: CampaignStructure) => void
  isSaving: boolean
  campaignId?: string // Optional: if provided, fetch and display validation status
}

export function CampaignStructurePreview({ structure: initialStructure, onSave, isSaving, campaignId }: CampaignStructurePreviewProps) {
  const [structure, setStructure] = useState(initialStructure)
  const [editingItem, setEditingItem] = useState<{ section: keyof CampaignStructure, index: number } | null>(null)
  const [editValues, setEditValues] = useState<StructureItem | null>(null)
  const [validationStatus, setValidationStatus] = useState<ExecutionReadinessResult | null>(null)
  const [isLoadingValidation, setIsLoadingValidation] = useState(false)

  // Fetch validation status if campaignId is provided
  useEffect(() => {
    if (!campaignId) return

    const fetchValidation = async () => {
      setIsLoadingValidation(true)
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/validation`)
        if (response.ok) {
          const data = await response.json()
          setValidationStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch validation status:', error)
      } finally {
        setIsLoadingValidation(false)
      }
    }

    fetchValidation()
  }, [campaignId, structure]) // Re-fetch when structure changes

  // Helper to get validation status for an element
  const getElementValidationStatus = (type: 'goal' | 'segment' | 'topic' | 'narrative', elementName: string): { status: ValidationStatus; tooltip: string } | null => {
    if (!validationStatus) return null

    const issues = validationStatus.issues.filter(
      issue => issue.type === type && issue.element === elementName
    )

    if (issues.length === 0) {
      return { status: 'complete', tooltip: 'Minden mező kitöltve' }
    }

    const missingFields = issues.map(i => i.issue).join(', ')
    const hasRequiredMissing = issues.some(i => !i.issue.includes('(recommended)'))

    return {
      status: hasRequiredMissing ? 'missing' : 'partial',
      tooltip: `Hiányzó mezők: ${missingFields}`
    }
  }

  const sections: { key: keyof CampaignStructure; label: string }[] = [
    { key: 'goals', label: 'Célok' },
    { key: 'segments', label: 'Célcsoportok' },
    { key: 'topics', label: 'Témák' },
    { key: 'narratives', label: 'Narratívák' },
    { key: 'segment_topic_matrix', label: 'Matrix' }
  ]

  const toggleSelection = (section: keyof CampaignStructure, index: number) => {
    if (section === 'segment_topic_matrix') return // Matrix doesn't have selection
    
    const newStructure = { ...structure }
    const sectionData = newStructure[section]
    if (Array.isArray(sectionData)) {
      // Initialize selected if undefined (default to true usually, but here we toggle)
      const isSelected = sectionData[index].selected !== false
      sectionData[index].selected = !isSelected
      setStructure(newStructure)
    }
  }

  const startEditing = (section: keyof CampaignStructure, index: number) => {
    if (section === 'segment_topic_matrix') return // Matrix editing is handled separately
    
    const sectionData = structure[section]
    if (Array.isArray(sectionData)) {
      setEditingItem({ section, index })
      setEditValues({ ...sectionData[index] })
    }
  }

  const saveEdit = () => {
    if (!editingItem || !editValues) return

    const newStructure = { ...structure }
    const sectionData = newStructure[editingItem.section]
    if (Array.isArray(sectionData)) {
      sectionData[editingItem.index] = editValues
    }
    setStructure(newStructure)
    setEditingItem(null)
    setEditValues(null)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditValues(null)
  }

  const handleMatrixChange = (newMatrix: MatrixEntry[]) => {
    setStructure({ ...structure, segment_topic_matrix: newMatrix })
  }

  const handleSaveSelected = () => {
    const selectedStructure = {
      goals: structure.goals.filter(i => i.selected !== false),
      segments: structure.segments.filter(i => i.selected !== false),
      topics: structure.topics.filter(i => i.selected !== false),
      narratives: structure.narratives.filter(i => i.selected !== false),
      segment_topic_matrix: structure.segment_topic_matrix || []
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
        <TabsList className="grid w-full grid-cols-5">
          {sections.map(section => (
            <TabsTrigger key={section.key} value={section.key}>
              {section.label}
              <Badge variant="secondary" className="ml-2">
                {section.key === 'segment_topic_matrix'
                  ? structure.segment_topic_matrix?.length || 0
                  : Array.isArray(structure[section.key])
                    ? structure[section.key].length
                    : 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(section => {
          // Special handling for matrix tab
          if (section.key === 'segment_topic_matrix') {
            return (
              <TabsContent key={section.key} value={section.key} className="mt-6">
                <SegmentTopicMatrixEditor
                  segments={structure.segments as any}
                  topics={structure.topics as any}
                  matrix={structure.segment_topic_matrix || []}
                  onMatrixChange={handleMatrixChange}
                />
              </TabsContent>
            )
          }

          return (
            <TabsContent key={section.key} value={section.key} className="mt-6">
              <div className="grid gap-4">
                {Array.isArray(structure[section.key]) && structure[section.key].map((item, index) => {
                  const elementName = item.title || item.name || `Item ${index + 1}`
                  const validationType = section.key === 'goals' ? 'goal' : 
                                       section.key === 'segments' ? 'segment' : 
                                       section.key === 'topics' ? 'topic' : 
                                       section.key === 'narratives' ? 'narrative' : null
                  const validation = validationType ? getElementValidationStatus(validationType, elementName) : null
                  const hasValidationIssues = validation && validation.status !== 'complete'

                  return (
                    <Card 
                      key={index} 
                      className={`relative transition-colors ${
                        item.selected === false ? 'opacity-60 bg-muted' : 
                        hasValidationIssues ? 'border-yellow-300 bg-yellow-50/30' : 
                        'border-primary/50'
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
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
                              <CardTitle className="text-lg flex items-center gap-2">
                                {item.title || item.name}
                                {validation && (
                                  <ValidationStatusIcon 
                                    status={validation.status} 
                                    tooltip={validation.tooltip}
                                  />
                                )}
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
                  )
                })}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
