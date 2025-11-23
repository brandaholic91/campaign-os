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
import { Plus, Edit, Trash2 } from 'lucide-react'

type Segment = Database['campaign_os']['Tables']['segments']['Row']
type SegmentInsert = Database['campaign_os']['Tables']['segments']['Insert']

// Type for JSONB fields
type DemographicsData = Json | null
type PsychographicsData = Json | null
type MediaHabitsData = Json | null
type ExamplePersonaData = Json | null

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
    demographics: null,
    psychographics: null,
    media_habits: null,
    example_persona: null,
    priority: null,
  })
  // Store JSON as strings in form for easier editing
  const [demographicsJson, setDemographicsJson] = useState<string>('')
  const [psychographicsJson, setPsychographicsJson] = useState<string>('')
  const [mediaHabitsJson, setMediaHabitsJson] = useState<string>('')
  const [examplePersonaJson, setExamplePersonaJson] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [expandedSegmentId, setExpandedSegmentId] = useState<string | null>(null)

  useEffect(() => {
    fetchSegments()
  }, [campaignId])

  async function fetchSegments() {
    try {
      const response = await fetch(`/api/segments?campaign_id=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch segments')
      const data = await response.json()
      setSegments(data)
    } catch (err) {
      console.error('Error fetching segments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load segments')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      // Parse and validate JSON fields
      let demographics: DemographicsData = null
      let psychographics: PsychographicsData = null
      let mediaHabits: MediaHabitsData = null
      let examplePersona: ExamplePersonaData = null

      if (demographicsJson.trim()) {
        try {
          const parsed = JSON.parse(demographicsJson.trim())
          demographics = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a demográfiai adatoknál. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      if (psychographicsJson.trim()) {
        try {
          const parsed = JSON.parse(psychographicsJson.trim())
          psychographics = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a pszichográfiai adatoknál. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      if (mediaHabitsJson.trim()) {
        try {
          const parsed = JSON.parse(mediaHabitsJson.trim())
          mediaHabits = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a média szokásoknál. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      if (examplePersonaJson.trim()) {
        try {
          const parsed = JSON.parse(examplePersonaJson.trim())
          examplePersona = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a példa personánál. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      const payload = {
        ...formData,
        campaign_id: campaignId,
        demographics,
        psychographics,
        media_habits: mediaHabits,
        example_persona: examplePersona,
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

      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', description: '', demographics: null, psychographics: null, media_habits: null, example_persona: null, priority: null })
      setDemographicsJson('')
      setPsychographicsJson('')
      setMediaHabitsJson('')
      setExamplePersonaJson('')
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
      demographics: segment.demographics as DemographicsData,
      psychographics: segment.psychographics as PsychographicsData,
      media_habits: segment.media_habits as MediaHabitsData,
      example_persona: segment.example_persona as ExamplePersonaData,
      priority: segment.priority,
    })
    // Convert JSONB to string for editing
    setDemographicsJson(
      segment.demographics 
        ? JSON.stringify(segment.demographics as DemographicsData, null, 2)
        : ''
    )
    setPsychographicsJson(
      segment.psychographics 
        ? JSON.stringify(segment.psychographics as PsychographicsData, null, 2)
        : ''
    )
    setMediaHabitsJson(
      segment.media_habits 
        ? JSON.stringify(segment.media_habits as MediaHabitsData, null, 2)
        : ''
    )
    setExamplePersonaJson(
      segment.example_persona 
        ? JSON.stringify(segment.example_persona as ExamplePersonaData, null, 2)
        : ''
    )
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', demographics: null, psychographics: null, media_habits: null, example_persona: null, priority: null })
    setDemographicsJson('')
    setPsychographicsJson('')
    setMediaHabitsJson('')
    setExamplePersonaJson('')
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

          <div className="space-y-2">
            <Label htmlFor="demographics">Demográfiai Profil (JSON)</Label>
            <Textarea
              id="demographics"
              value={demographicsJson}
              onChange={(e) => setDemographicsJson(e.target.value)}
              placeholder='{"age_range": "20-35", "location_type": "városi", "income_level": "közepes"}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychographics">Pszichográfiai Profil (JSON)</Label>
            <Textarea
              id="psychographics"
              value={psychographicsJson}
              onChange={(e) => setPsychographicsJson(e.target.value)}
              placeholder='{"values": ["fenntarthatóság"], "pain_points": ["drágaság"]}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media_habits">Média Szokások (JSON)</Label>
            <Textarea
              id="media_habits"
              value={mediaHabitsJson}
              onChange={(e) => setMediaHabitsJson(e.target.value)}
              placeholder='{"primary_channels": ["Facebook", "Instagram"], "secondary_channels": ["TikTok"], "notes": "Aktív social media felhasználók"}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example_persona">Példa Persona (JSON)</Label>
            <Textarea
              id="example_persona"
              value={examplePersonaJson}
              onChange={(e) => setExamplePersonaJson(e.target.value)}
              placeholder='{"name": "Márta", "one_sentence_story": "30 éves marketinges, aki értékeli a fenntarthatóságot"}'
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Frissítés' : 'Létrehozás'}</Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Mégse
            </Button>
          </div>
        </form>
      )}

      {segments.length === 0 ? (
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
              {segments.map((segment) => {
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
                            {segment.demographics && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Demográfiai Profil</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(segment.demographics, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Pszichográfiai Profil */}
                            {segment.psychographics && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Pszichográfiai Profil</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(segment.psychographics, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Média Szokások */}
                            {segment.media_habits && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Média Szokások</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(segment.media_habits, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Példa Persona */}
                            {segment.example_persona && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Példa Persona</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(segment.example_persona, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* További információk */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700">További információk</h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
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

