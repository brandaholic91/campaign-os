'use client'

import { useState, useEffect } from 'react'
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
    priority: null,
  })
  // Store JSON as strings in form for easier editing
  const [demographicsJson, setDemographicsJson] = useState<string>('')
  const [psychographicsJson, setPsychographicsJson] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

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

      const payload = {
        ...formData,
        campaign_id: campaignId,
        demographics,
        psychographics,
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
      setFormData({ name: '', description: '', demographics: null, psychographics: null, priority: null })
      setDemographicsJson('')
      setPsychographicsJson('')
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
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', demographics: null, psychographics: null, priority: null })
    setDemographicsJson('')
    setPsychographicsJson('')
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
              {segments.map((segment) => (
                <tr key={segment.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-4 align-top">
                    <span className="font-display font-bold text-gray-900 text-sm leading-snug block">
                      {segment.name}
                    </span>
                  </td>
                  <td className="py-6 px-4 align-top">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {segment.description || '-'}
                    </p>
                  </td>
                  <td className="py-6 px-4 align-top text-center">
                    {segment.priority ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">
                        {segment.priority}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-6 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

