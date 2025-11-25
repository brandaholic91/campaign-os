'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Database, Json } from '@/lib/supabase/types'
import { Plus, Edit, Trash2, X } from 'lucide-react'

type Segment = Database['campaign_os']['Tables']['segments']['Row']
type SegmentInsert = Database['campaign_os']['Tables']['segments']['Insert']

// Type definitions for structured form data
interface DemographicsFormData {
  age_range: string
  location_type: string
  income_level: string
  other_demographics: string
}

interface PsychographicsFormData {
  values: string[]
  attitudes_to_campaign_topic: string[]
  motivations: string[]
  pain_points: string[]
}

interface MediaHabitsFormData {
  primary_channels: string[]
  secondary_channels: string[]
  notes: string
}

interface ExamplePersonaFormData {
  name: string
  one_sentence_story: string
}

interface SegmentManagerProps {
  campaignId: string
}

export function SegmentManager({ campaignId }: SegmentManagerProps) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<SegmentInsert>>({
    name: '',
    description: '',
    priority: null,
  })
  
  // Structured form data for JSONB fields
  const [demographicsData, setDemographicsData] = useState<DemographicsFormData>({
    age_range: '',
    location_type: '',
    income_level: '',
    other_demographics: '',
  })
  
  const [psychographicsData, setPsychographicsData] = useState<PsychographicsFormData>({
    values: [],
    attitudes_to_campaign_topic: [],
    motivations: [],
    pain_points: [],
  })
  
  const [mediaHabitsData, setMediaHabitsData] = useState<MediaHabitsFormData>({
    primary_channels: [],
    secondary_channels: [],
    notes: '',
  })
  
  const [examplePersonaData, setExamplePersonaData] = useState<ExamplePersonaFormData>({
    name: '',
    one_sentence_story: '',
  })
  
  const [showForm, setShowForm] = useState(false)
  const [expandedSegmentId, setExpandedSegmentId] = useState<string | null>(null)
  
  // Helper function to parse JSONB data from database
  function parseJsonbField<T extends Record<string, any>>(field: Json | null, defaultVal: T): T {
    if (!field || typeof field !== 'object' || Array.isArray(field)) return defaultVal
    return { ...defaultVal, ...(field as Record<string, any>) } as T
  }
  
  // Helper function to convert form data to JSONB format
  function demographicsToJsonb(data: DemographicsFormData): Json | null {
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v && v.trim() !== '')
    )
    return Object.keys(cleaned).length > 0 ? cleaned : null
  }
  
  function psychographicsToJsonb(data: PsychographicsFormData): Json | null {
    const cleaned: any = {}
    if (data.values.length > 0) cleaned.values = data.values.filter(v => v.trim() !== '')
    if (data.attitudes_to_campaign_topic.length > 0) cleaned.attitudes_to_campaign_topic = data.attitudes_to_campaign_topic.filter(v => v.trim() !== '')
    if (data.motivations.length > 0) cleaned.motivations = data.motivations.filter(v => v.trim() !== '')
    if (data.pain_points.length > 0) cleaned.pain_points = data.pain_points.filter(v => v.trim() !== '')
    return Object.keys(cleaned).length > 0 ? cleaned : null
  }
  
  function mediaHabitsToJsonb(data: MediaHabitsFormData): Json | null {
    const cleaned: any = {}
    if (data.primary_channels.length > 0) cleaned.primary_channels = data.primary_channels.filter(v => v.trim() !== '')
    if (data.secondary_channels.length > 0) cleaned.secondary_channels = data.secondary_channels.filter(v => v.trim() !== '')
    if (data.notes.trim()) cleaned.notes = data.notes.trim()
    return Object.keys(cleaned).length > 0 ? cleaned : null
  }
  
  function examplePersonaToJsonb(data: ExamplePersonaFormData): Json | null {
    if (!data.name.trim() && !data.one_sentence_story.trim()) return null
    return {
      name: data.name.trim() || '',
      one_sentence_story: data.one_sentence_story.trim() || '',
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [campaignId])

  async function fetchSegments() {
    try {
      const response = await fetch(`/api/segments?campaign_id=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch segments')
      const data = await response.json()
      // Ensure data is always an array
      setSegments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching segments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load segments')
      setSegments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      // Convert structured form data to JSONB format
      const demographics = demographicsToJsonb(demographicsData)
      const psychographics = psychographicsToJsonb(psychographicsData)
      const mediaHabits = mediaHabitsToJsonb(mediaHabitsData)
      const examplePersona = examplePersonaToJsonb(examplePersonaData)

      const payload = {
        ...formData,
        campaign_id: campaignId,
        demographics,
        psychographics,
        media_habits: mediaHabits,
        example_persona: examplePersona,
        // Also include structured fields for API compatibility
        demographic_profile: demographics,
        psychographic_profile: psychographics,
      }

      let response
      if (editingId) {
        response = await fetch('/api/segments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        response = await fetch('/api/segments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save segment')
      }

      // Reset form
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', description: '', priority: null })
      setDemographicsData({ age_range: '', location_type: '', income_level: '', other_demographics: '' })
      setPsychographicsData({ values: [], attitudes_to_campaign_topic: [], motivations: [], pain_points: [] })
      setMediaHabitsData({ primary_channels: [], secondary_channels: [], notes: '' })
      setExamplePersonaData({ name: '', one_sentence_story: '' })
      fetchSegments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save segment')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Biztosan törölni szeretnéd ezt a célcsoportot?')) return

    try {
      const response = await fetch(`/api/segments?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete segment')
      fetchSegments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete segment')
    }
  }

  function handleEdit(segment: Segment) {
    setEditingId(segment.id)
    setFormData({
      name: segment.name,
      description: segment.description || '',
      priority: segment.priority,
      short_label: segment.short_label || null,
      funnel_stage_focus: segment.funnel_stage_focus || null,
    })
    
    // Parse JSONB fields to structured form data
    const demographics = parseJsonbField(segment.demographics || segment.demographic_profile, { age_range: '', location_type: '', income_level: '', other_demographics: '' })
    setDemographicsData(demographics)
    
    const psychographics = parseJsonbField(segment.psychographics || segment.psychographic_profile, { values: [], attitudes_to_campaign_topic: [], motivations: [], pain_points: [] })
    setPsychographicsData({
      values: Array.isArray(psychographics.values) ? psychographics.values : [],
      attitudes_to_campaign_topic: Array.isArray(psychographics.attitudes_to_campaign_topic) ? psychographics.attitudes_to_campaign_topic : [],
      motivations: Array.isArray(psychographics.motivations) ? psychographics.motivations : [],
      pain_points: Array.isArray(psychographics.pain_points) ? psychographics.pain_points : [],
    })
    
    const mediaHabits = parseJsonbField(segment.media_habits, { primary_channels: [], secondary_channels: [], notes: '' })
    setMediaHabitsData({
      primary_channels: Array.isArray(mediaHabits.primary_channels) ? mediaHabits.primary_channels : [],
      secondary_channels: Array.isArray(mediaHabits.secondary_channels) ? mediaHabits.secondary_channels : [],
      notes: typeof mediaHabits.notes === 'string' ? mediaHabits.notes : '',
    })
    
    const examplePersona = parseJsonbField(segment.example_persona, { name: '', one_sentence_story: '' })
    setExamplePersonaData({
      name: typeof examplePersona.name === 'string' ? examplePersona.name : '',
      one_sentence_story: typeof examplePersona.one_sentence_story === 'string' ? examplePersona.one_sentence_story : '',
    })
    
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', priority: null })
    setDemographicsData({ age_range: '', location_type: '', income_level: '', other_demographics: '' })
    setPsychographicsData({ values: [], attitudes_to_campaign_topic: [], motivations: [], pain_points: [] })
    setMediaHabitsData({ primary_channels: [], secondary_channels: [], notes: '' })
    setExamplePersonaData({ name: '', one_sentence_story: '' })
  }
  
  // Helper component for dynamic array inputs
  function ArrayInput({ 
    label, 
    values, 
    onChange, 
    placeholder 
  }: { 
    label: string
    values: string[]
    onChange: (values: string[]) => void
    placeholder?: string
  }) {
    const addItem = () => {
      onChange([...values, ''])
    }
    
    const updateItem = (index: number, value: string) => {
      const newValues = [...values]
      newValues[index] = value
      onChange(newValues)
    }
    
    const removeItem = (index: number) => {
      onChange(values.filter((_, i) => i !== index))
    }
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="space-y-2">
          {values.map((value, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={placeholder || 'Adjon meg egy értéket...'}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeItem(index)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Hozzáadás
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Betöltés...</div>
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-display font-bold text-gray-900">Célcsoportok</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Mégse' : 'Új célcsoport'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-gray-200 rounded-xl mb-8 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Név *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_label">Rövid címke (UI)</Label>
              <Input
                id="short_label"
                value={formData.short_label || ''}
                onChange={(e) => setFormData({ ...formData, short_label: e.target.value || null })}
                placeholder="pl. 20-35 városi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioritás</Label>
              <select
                id="priority"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.priority || 'secondary'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'primary' | 'secondary' })}
              >
                <option value="primary">Elsődleges</option>
                <option value="secondary">Másodlagos</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="funnel_stage_focus">Funnel Fókusz</Label>
              <select
                id="funnel_stage_focus"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.funnel_stage_focus || 'awareness'}
                onChange={(e) => setFormData({ ...formData, funnel_stage_focus: e.target.value as any })}
              >
                <option value="awareness">Ismertség (Awareness)</option>
                <option value="engagement">Elköteleződés (Engagement)</option>
                <option value="consideration">Megfontolás (Consideration)</option>
                <option value="conversion">Konverzió (Conversion)</option>
                <option value="mobilization">Mobilizáció (Mobilization)</option>
              </select>
            </div>
          </div>

          {/* Demográfiai Profil */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Demográfiai Profil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age_range">Korosztály</Label>
                <Input
                  id="age_range"
                  value={demographicsData.age_range}
                  onChange={(e) => setDemographicsData({ ...demographicsData, age_range: e.target.value })}
                  placeholder="pl. 25-35"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_type">Lakóhely típusa</Label>
                <Input
                  id="location_type"
                  value={demographicsData.location_type}
                  onChange={(e) => setDemographicsData({ ...demographicsData, location_type: e.target.value })}
                  placeholder="pl. városi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income_level">Jövedelmi szint</Label>
                <Input
                  id="income_level"
                  value={demographicsData.income_level}
                  onChange={(e) => setDemographicsData({ ...demographicsData, income_level: e.target.value })}
                  placeholder="pl. középkategória"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_demographics">Egyéb demográfiai információk</Label>
                <Input
                  id="other_demographics"
                  value={demographicsData.other_demographics}
                  onChange={(e) => setDemographicsData({ ...demographicsData, other_demographics: e.target.value })}
                  placeholder="pl. felsőfokú végzettség"
                />
              </div>
            </div>
          </div>

          {/* Pszichográfiai Profil */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Pszichográfiai Profil</h3>
            <div className="space-y-4">
              <ArrayInput
                label="Értékek"
                values={psychographicsData.values}
                onChange={(values) => setPsychographicsData({ ...psychographicsData, values })}
                placeholder="pl. minőség"
              />
              <ArrayInput
                label="Kampány témával szembeni attitűdök"
                values={psychographicsData.attitudes_to_campaign_topic}
                onChange={(values) => setPsychographicsData({ ...psychographicsData, attitudes_to_campaign_topic: values })}
                placeholder="pl. érdeklődő"
              />
              <ArrayInput
                label="Motivációk"
                values={psychographicsData.motivations}
                onChange={(values) => setPsychographicsData({ ...psychographicsData, motivations: values })}
                placeholder="pl. új ízek felfedezése"
              />
              <ArrayInput
                label="Fájdalmak / Problémák"
                values={psychographicsData.pain_points}
                onChange={(values) => setPsychographicsData({ ...psychographicsData, pain_points: values })}
                placeholder="pl. túl sok választási lehetőség"
              />
            </div>
          </div>

          {/* Média Szokások */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Média Szokások</h3>
            <div className="space-y-4">
              <ArrayInput
                label="Elsődleges csatornák"
                values={mediaHabitsData.primary_channels}
                onChange={(values) => setMediaHabitsData({ ...mediaHabitsData, primary_channels: values })}
                placeholder="pl. Instagram"
              />
              <ArrayInput
                label="Másodlagos csatornák"
                values={mediaHabitsData.secondary_channels}
                onChange={(values) => setMediaHabitsData({ ...mediaHabitsData, secondary_channels: values })}
                placeholder="pl. YouTube"
              />
              <div className="space-y-2">
                <Label htmlFor="media_notes">Megjegyzések</Label>
                <Textarea
                  id="media_notes"
                  value={mediaHabitsData.notes}
                  onChange={(e) => setMediaHabitsData({ ...mediaHabitsData, notes: e.target.value })}
                  placeholder="pl. Közösségi média az elsődleges információforrás."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Példa Persona */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Példa Persona</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="persona_name">Név</Label>
                <Input
                  id="persona_name"
                  value={examplePersonaData.name}
                  onChange={(e) => setExamplePersonaData({ ...examplePersonaData, name: e.target.value })}
                  placeholder="pl. Kata"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona_story">Egy mondatos történet</Label>
                <Textarea
                  id="persona_story"
                  value={examplePersonaData.one_sentence_story}
                  onChange={(e) => setExamplePersonaData({ ...examplePersonaData, one_sentence_story: e.target.value })}
                  placeholder="pl. Kata fiatal szakember, aki szereti felfedezni az új prémium söröket a barátaival."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Frissítés' : 'Létrehozás'}</Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Mégse
            </Button>
          </div>
        </form>
      )}

      {!segments || segments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">Még nincsenek célcsoportok</p>
          <p className="text-sm">Kattints az "Új célcsoport" gombra a hozzáadáshoz</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-1/4">Név</th>
                <th className="py-4 px-4 w-1/2">Leírás</th>
                <th className="py-4 px-4 w-24 text-center">Prioritás</th>
                <th className="py-4 px-4 w-32 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(segments || []).map((segment) => {
                const isExpanded = expandedSegmentId === segment.id
                return (
                  <React.Fragment key={segment.id}>
                    <tr className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 px-4 align-top">
                        <span className="font-display font-bold text-gray-900 text-sm leading-snug block">
                          {segment.name}
                        </span>
                        {segment.short_label && (
                          <span className="text-xs text-gray-500 mt-1 block">{segment.short_label}</span>
                        )}
                      </td>
                      <td className="py-6 px-4 align-top">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {segment.description || '-'}
                        </p>
                      </td>
                      <td className="py-6 px-4 align-top text-center">
                        {segment.priority ? (
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                            segment.priority === 'primary' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {segment.priority === 'primary' ? 'Elsődleges' : 'Másodlagos'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-6 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
                            onClick={() => setExpandedSegmentId(isExpanded ? null : segment.id)}
                            title={isExpanded ? 'Összecsukás' : 'Részletek'}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </button>
                          <button 
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
                            onClick={() => handleEdit(segment)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-rose-300 hover:text-rose-600 transition-colors shadow-sm"
                            onClick={() => handleDelete(segment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={4} className="px-4 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Demográfiai Profil */}
                            {(segment.demographics || segment.demographic_profile) && (() => {
                              const demographics = segment.demographics || segment.demographic_profile || {}
                              const demoObj = typeof demographics === 'object' && demographics !== null ? demographics : {}
                              return (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Demográfiai Profil</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                    {demoObj.age_range && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500">Korosztály: </span>
                                        <span className="text-xs text-gray-700">{String(demoObj.age_range)}</span>
                                      </div>
                                    )}
                                    {demoObj.location_type && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500">Lakóhely típusa: </span>
                                        <span className="text-xs text-gray-700">{String(demoObj.location_type)}</span>
                                      </div>
                                    )}
                                    {demoObj.income_level && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500">Jövedelmi szint: </span>
                                        <span className="text-xs text-gray-700">{String(demoObj.income_level)}</span>
                                      </div>
                                    )}
                                    {demoObj.other_demographics && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500">Egyéb: </span>
                                        <span className="text-xs text-gray-700">{String(demoObj.other_demographics)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })()}

                            {/* Pszichográfiai Profil */}
                            {(segment.psychographics || segment.psychographic_profile) && (() => {
                              const psychographics = segment.psychographics || segment.psychographic_profile || {}
                              const psychoObj = typeof psychographics === 'object' && psychographics !== null ? psychographics : {}
                              return (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Pszichográfiai Profil</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                    {Array.isArray(psychoObj.values) && psychoObj.values.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Értékek:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {psychoObj.values.map((value: string, idx: number) => (
                                            <span key={idx} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                              {value}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {Array.isArray(psychoObj.attitudes_to_campaign_topic) && psychoObj.attitudes_to_campaign_topic.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Kampány témával szembeni attitűdök:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {psychoObj.attitudes_to_campaign_topic.map((attitude: string, idx: number) => (
                                            <span key={idx} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                              {attitude}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {Array.isArray(psychoObj.motivations) && psychoObj.motivations.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Motivációk:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {psychoObj.motivations.map((motivation: string, idx: number) => (
                                            <span key={idx} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                              {motivation}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {Array.isArray(psychoObj.pain_points) && psychoObj.pain_points.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Fájdalmak / Problémák:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {psychoObj.pain_points.map((pain: string, idx: number) => (
                                            <span key={idx} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                              {pain}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })()}

                            {/* Média Szokások */}
                            {segment.media_habits && (() => {
                              const mediaHabits = typeof segment.media_habits === 'object' && segment.media_habits !== null ? segment.media_habits : {}
                              return (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Média Szokások</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                    {Array.isArray(mediaHabits.primary_channels) && mediaHabits.primary_channels.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Elsődleges csatornák:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {mediaHabits.primary_channels.map((channel: string, idx: number) => (
                                            <span key={idx} className="text-xs text-gray-700 bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                              {channel}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {Array.isArray(mediaHabits.secondary_channels) && mediaHabits.secondary_channels.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Másodlagos csatornák:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {mediaHabits.secondary_channels.map((channel: string, idx: number) => (
                                            <span key={idx} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                              {channel}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {mediaHabits.notes && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Megjegyzések:</span>
                                        <p className="text-xs text-gray-700">{String(mediaHabits.notes)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })()}

                            {/* Példa Persona */}
                            {segment.example_persona && (() => {
                              const persona = typeof segment.example_persona === 'object' && segment.example_persona !== null ? segment.example_persona : {}
                              return (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Példa Persona</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                    {persona.name && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500">Név: </span>
                                        <span className="text-xs text-gray-700 font-semibold">{String(persona.name)}</span>
                                      </div>
                                    )}
                                    {persona.one_sentence_story && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">Egy mondatos történet:</span>
                                        <p className="text-xs text-gray-700 italic">"{String(persona.one_sentence_story)}"</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })()}

                            {/* További információk */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700">További információk</h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                {segment.funnel_stage_focus && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">Funnel Fókusz: </span>
                                    <span className="text-xs text-gray-700">{segment.funnel_stage_focus}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

