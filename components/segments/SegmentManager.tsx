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
import { Database } from '@/lib/supabase/types'
import { Plus, Edit, Trash2 } from 'lucide-react'

type Segment = Database['public']['Tables']['segments']['Row']
type SegmentInsert = Database['public']['Tables']['segments']['Insert']

// Type for JSONB fields
type DemographicsData = Record<string, unknown> | null
type PsychographicsData = Record<string, unknown> | null

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Célcsoportok</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Mégse' : 'Új célcsoport'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
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
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioritás (1-5)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="5"
              value={formData.priority ?? ''}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demographics">Demográfiai adatok (JSON)</Label>
            <Textarea
              id="demographics"
              value={demographicsJson}
              onChange={(e) => setDemographicsJson(e.target.value)}
              placeholder='{"age": "25-35", "location": "Budapest", "income": "middle"}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Opcionális JSON formátumú adatok (pl. életkor, hely, jövedelem)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychographics">Pszichográfiai adatok (JSON)</Label>
            <Textarea
              id="psychographics"
              value={psychographicsJson}
              onChange={(e) => setPsychographicsJson(e.target.value)}
              placeholder='{"values": ["sustainability", "quality"], "lifestyle": "urban"}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Opcionális JSON formátumú adatok (pl. értékek, életstílus, attitűdök)
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Frissítés' : 'Létrehozás'}</Button>
            <Button type="button" onClick={handleCancel} className="border border-input bg-background hover:bg-accent">
              Mégse
            </Button>
          </div>
        </form>
      )}

      {segments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Még nincsenek célcsoportok</p>
          <p className="text-sm mt-2">Kattints az "Új célcsoport" gombra a hozzáadáshoz</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Név</TableHead>
              <TableHead>Leírás</TableHead>
              <TableHead>Prioritás</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.map((segment) => (
              <TableRow key={segment.id}>
                <TableCell className="font-medium">{segment.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {segment.description || '-'}
                </TableCell>
                <TableCell>{segment.priority || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      className="hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleEdit(segment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className="hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleDelete(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

