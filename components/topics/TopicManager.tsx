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

type Topic = Database['campaign_os']['Tables']['topics']['Row']
type TopicInsert = Database['campaign_os']['Tables']['topics']['Insert']

// Type for JSONB fields
type ContentAnglesData = Json | null
type RecommendedChannelsData = Json | null
type RelatedGoalTypesData = Json | null
type RiskNotesData = Json | null

interface TopicManagerProps {
  campaignId: string
}

export function TopicManager({ campaignId }: TopicManagerProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TopicInsert>>({
    name: '',
    description: '',
    category: '',
    content_angles: null,
    recommended_channels: null,
    related_goal_types: null,
    risk_notes: null,
  })
  // Store JSON as strings in form for easier editing
  const [contentAnglesJson, setContentAnglesJson] = useState<string>('')
  const [recommendedChannelsJson, setRecommendedChannelsJson] = useState<string>('')
  const [relatedGoalTypesJson, setRelatedGoalTypesJson] = useState<string>('')
  const [riskNotesJson, setRiskNotesJson] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)

  useEffect(() => {
    fetchTopics()
  }, [campaignId])

  async function fetchTopics() {
    try {
      const response = await fetch(`/api/topics?campaign_id=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch topics')
      const data = await response.json()
      setTopics(data)
    } catch (err) {
      console.error('Error fetching topics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      // Parse and validate JSON fields
      let contentAngles: ContentAnglesData = null
      let recommendedChannels: RecommendedChannelsData = null
      let relatedGoalTypes: RelatedGoalTypesData = null
      let riskNotes: RiskNotesData = null

      if (contentAnglesJson.trim()) {
        try {
          const parsed = JSON.parse(contentAnglesJson.trim())
          contentAngles = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a tartalomszögeknél. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      if (recommendedChannelsJson.trim()) {
        try {
          const parsed = JSON.parse(recommendedChannelsJson.trim())
          recommendedChannels = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum az ajánlott csatornáknál. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      if (relatedGoalTypesJson.trim()) {
        try {
          const parsed = JSON.parse(relatedGoalTypesJson.trim())
          relatedGoalTypes = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a kapcsolódó cél típusoknál. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      if (riskNotesJson.trim()) {
        try {
          const parsed = JSON.parse(riskNotesJson.trim())
          riskNotes = typeof parsed === 'object' && parsed !== null ? parsed : null
        } catch (parseError) {
          setError('Érvénytelen JSON formátum a kockázati megjegyzéseknél. Kérlek ellenőrizd a szintaxist.')
          return
        }
      }

      const payload = {
        ...formData,
        campaign_id: campaignId,
        description: formData.description || null,
        category: formData.category || null,
        content_angles: contentAngles,
        recommended_channels: recommendedChannels,
        related_goal_types: relatedGoalTypes,
        risk_notes: riskNotes,
      }

      let response
      if (editingId) {
        response = await fetch('/api/topics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        response = await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save topic')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', description: '', category: '', content_angles: null, recommended_channels: null, related_goal_types: null, risk_notes: null })
      setContentAnglesJson('')
      setRecommendedChannelsJson('')
      setRelatedGoalTypesJson('')
      setRiskNotesJson('')
      fetchTopics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save topic')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Biztosan törölni szeretnéd ezt a témát?')) return

    try {
      const response = await fetch(`/api/topics?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete topic')
      fetchTopics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic')
    }
  }

  function handleEdit(topic: Topic) {
    setEditingId(topic.id)
    setFormData({
      name: topic.name,
      description: topic.description || '',
      category: topic.category || '',
      short_label: topic.short_label || '',
      topic_type: topic.topic_type || 'benefit',
      core_narrative: topic.core_narrative || '',
      priority: topic.priority || 'secondary',
      content_angles: topic.content_angles as ContentAnglesData,
      recommended_channels: topic.recommended_channels as RecommendedChannelsData,
      related_goal_types: topic.related_goal_types as RelatedGoalTypesData,
      risk_notes: topic.risk_notes as RiskNotesData,
    })
    // Convert JSONB to string for editing
    setContentAnglesJson(
      topic.content_angles 
        ? JSON.stringify(topic.content_angles as ContentAnglesData, null, 2)
        : ''
    )
    setRecommendedChannelsJson(
      topic.recommended_channels 
        ? JSON.stringify(topic.recommended_channels as RecommendedChannelsData, null, 2)
        : ''
    )
    setRelatedGoalTypesJson(
      topic.related_goal_types 
        ? JSON.stringify(topic.related_goal_types as RelatedGoalTypesData, null, 2)
        : ''
    )
    setRiskNotesJson(
      topic.risk_notes 
        ? JSON.stringify(topic.risk_notes as RiskNotesData, null, 2)
        : ''
    )
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', category: '', content_angles: null, recommended_channels: null, related_goal_types: null, risk_notes: null })
    setContentAnglesJson('')
    setRecommendedChannelsJson('')
    setRelatedGoalTypesJson('')
    setRiskNotesJson('')
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Betöltés...</div>
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-display font-bold text-gray-900">Témák</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Mégse' : 'Új téma'}
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
                placeholder="pl. Zöld = spórolás"
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
              <Label htmlFor="topic_type">Téma Típusa</Label>
              <select
                id="topic_type"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.topic_type || 'benefit'}
                onChange={(e) => setFormData({ ...formData, topic_type: e.target.value as any })}
              >
                <option value="benefit">Előny (Benefit)</option>
                <option value="problem">Probléma (Problem)</option>
                <option value="value">Érték (Value)</option>
                <option value="proof">Bizonyíték (Proof)</option>
                <option value="story">Történet (Story)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="core_narrative">Alapnarratíva</Label>
            <Textarea
              id="core_narrative"
              value={formData.core_narrative || ''}
              onChange={(e) => setFormData({ ...formData, core_narrative: e.target.value || null })}
              rows={2}
              placeholder="1-2 mondatos összefoglaló a témáról"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategória (Legacy)</Label>
            <Input
              id="category"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_angles">Tartalomszögek (JSON)</Label>
            <Textarea
              id="content_angles"
              value={contentAnglesJson}
              onChange={(e) => setContentAnglesJson(e.target.value)}
              placeholder='["Szöveg alapú posztok", "Infografikák", "Videó tartalom"]'
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommended_channels">Ajánlott Csatornák (JSON)</Label>
            <Textarea
              id="recommended_channels"
              value={recommendedChannelsJson}
              onChange={(e) => setRecommendedChannelsJson(e.target.value)}
              placeholder='["Facebook", "Instagram", "TikTok"]'
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="related_goal_types">Kapcsolódó Cél Típusok (JSON)</Label>
            <Textarea
              id="related_goal_types"
              value={relatedGoalTypesJson}
              onChange={(e) => setRelatedGoalTypesJson(e.target.value)}
              placeholder='["awareness", "engagement", "conversion"]'
              rows={2}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_notes">Kockázati Megjegyzések (JSON)</Label>
            <Textarea
              id="risk_notes"
              value={riskNotesJson}
              onChange={(e) => setRiskNotesJson(e.target.value)}
              placeholder='["Politikai érzékenység", "Jogi korlátok"]'
              rows={2}
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

      {topics.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">Még nincsenek témák</p>
          <p className="text-sm">Kattints az "Új téma" gombra a hozzáadáshoz</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-1/4">Név</th>
                <th className="py-4 px-4 w-1/2">Leírás</th>
                <th className="py-4 px-4 w-48">Kategória</th>
                <th className="py-4 px-4 w-32 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topics.map((topic) => {
                const isExpanded = expandedTopicId === topic.id
                return (
                  <React.Fragment key={topic.id}>
                    <tr className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 px-4 align-top">
                        <span className="font-display font-bold text-gray-900 text-sm leading-snug block">
                          {topic.name}
                        </span>
                        {topic.short_label && (
                          <span className="text-xs text-gray-500 mt-1 block">{topic.short_label}</span>
                        )}
                      </td>
                      <td className="py-6 px-4 align-top">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {topic.description || '-'}
                        </p>
                        {topic.core_narrative && (
                          <p className="text-xs text-gray-500 mt-2 italic">{topic.core_narrative}</p>
                        )}
                      </td>
                      <td className="py-6 px-4 align-top">
                        <div className="flex flex-col gap-2">
                          {topic.category && (
                            <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 w-fit">
                              {topic.category}
                            </span>
                          )}
                          {topic.priority && (
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                              topic.priority === 'primary' 
                                ? 'bg-primary-100 text-primary-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {topic.priority === 'primary' ? 'Elsődleges' : 'Másodlagos'}
                            </span>
                          )}
                          {topic.topic_type && (
                            <span className="inline-flex px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 w-fit">
                              {topic.topic_type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
                            onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                            title={isExpanded ? 'Összecsukás' : 'Részletek'}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </button>
                          <button 
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
                            onClick={() => handleEdit(topic)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-rose-300 hover:text-rose-600 transition-colors shadow-sm"
                            onClick={() => handleDelete(topic.id)}
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
                            {/* Alapnarratíva */}
                            {topic.core_narrative && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Alapnarratíva</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-600">{topic.core_narrative}</p>
                                </div>
                              </div>
                            )}

                            {/* Téma Típusa */}
                            {topic.topic_type && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Téma Típusa</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <span className="text-sm text-gray-600">{topic.topic_type}</span>
                                </div>
                              </div>
                            )}

                            {/* Tartalomszögek */}
                            {topic.content_angles && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Tartalomszögek</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(topic.content_angles, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Ajánlott Csatornák */}
                            {topic.recommended_channels && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Ajánlott Csatornák</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(topic.recommended_channels, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Kapcsolódó Cél Típusok */}
                            {topic.related_goal_types && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Kapcsolódó Cél Típusok</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(topic.related_goal_types, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Kockázati Megjegyzések */}
                            {topic.risk_notes && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Kockázati Megjegyzések</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(topic.risk_notes, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
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

