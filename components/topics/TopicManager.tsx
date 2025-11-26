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

type Topic = Database['campaign_os']['Tables']['topics']['Row']
type TopicInsert = Database['campaign_os']['Tables']['topics']['Insert']

// Type definitions for structured form data
interface TopicFormData {
  content_angles: string[]
  recommended_channels: string[]
  related_goal_types: string[]
  risk_notes: string[]
}

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
  })
  
  // Structured form data for JSONB fields
  const [topicFormData, setTopicFormData] = useState<TopicFormData>({
    content_angles: [],
    recommended_channels: [],
    related_goal_types: [],
    risk_notes: [],
  })
  
  const [showForm, setShowForm] = useState(false)
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
  
  // Helper function to parse JSONB array fields
  function parseJsonbArray(field: Json | null): string[] {
    if (!field) return []
    if (Array.isArray(field)) {
      return field.filter((item): item is string => typeof item === 'string')
    }
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
      } catch {
        return [field]
      }
    }
    return []
  }
  
  // Helper function to convert array to JSONB format
  function arrayToJsonb(arr: string[]): Json | null {
    const cleaned = arr.filter(v => v && v.trim() !== '')
    return cleaned.length > 0 ? cleaned : null
  }

  useEffect(() => {
    fetchTopics()
  }, [campaignId])

  async function fetchTopics() {
    try {
      const response = await fetch(`/api/topics?campaign_id=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch topics')
      const data = await response.json()
      // Ensure data is always an array
      setTopics(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching topics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load topics')
      setTopics([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      // Convert structured form data to JSONB format
      const contentAngles = arrayToJsonb(topicFormData.content_angles)
      const recommendedChannels = arrayToJsonb(topicFormData.recommended_channels)
      const relatedGoalTypes = arrayToJsonb(topicFormData.related_goal_types)
      const riskNotes = arrayToJsonb(topicFormData.risk_notes)

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

      // Reset form
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', description: '', category: '' })
      setTopicFormData({
        content_angles: [],
        recommended_channels: [],
        related_goal_types: [],
        risk_notes: [],
      })
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
    })
    
    // Parse JSONB fields to structured form data
    setTopicFormData({
      content_angles: parseJsonbArray(topic.content_angles),
      recommended_channels: parseJsonbArray(topic.recommended_channels),
      related_goal_types: parseJsonbArray(topic.related_goal_types),
      risk_notes: parseJsonbArray(topic.risk_notes),
    })
    
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', category: '' })
    setTopicFormData({
      content_angles: [],
      recommended_channels: [],
      related_goal_types: [],
      risk_notes: [],
    })
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

          {/* Tartalomszögek */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Tartalomszögek</h3>
            <ArrayInput
              label="Tartalomszögek"
              values={topicFormData.content_angles}
              onChange={(values) => setTopicFormData({ ...topicFormData, content_angles: values })}
              placeholder="pl. Szöveg alapú posztok"
            />
          </div>

          {/* Ajánlott Csatornák */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Ajánlott Csatornák</h3>
            <ArrayInput
              label="Ajánlott Csatornák"
              values={topicFormData.recommended_channels}
              onChange={(values) => setTopicFormData({ ...topicFormData, recommended_channels: values })}
              placeholder="pl. Instagram"
            />
          </div>

          {/* Kapcsolódó Cél Típusok */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Kapcsolódó Cél Típusok</h3>
            <ArrayInput
              label="Kapcsolódó Cél Típusok"
              values={topicFormData.related_goal_types}
              onChange={(values) => setTopicFormData({ ...topicFormData, related_goal_types: values })}
              placeholder="pl. awareness"
            />
          </div>

          {/* Kockázati Megjegyzések */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-sm font-semibold text-gray-700">Kockázati Megjegyzések</h3>
            <ArrayInput
              label="Kockázati Megjegyzések"
              values={topicFormData.risk_notes}
              onChange={(values) => setTopicFormData({ ...topicFormData, risk_notes: values })}
              placeholder="pl. Politikai érzékenység"
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

      {!topics || topics.length === 0 ? (
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
              {(topics || []).map((topic) => {
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
                            {topic.content_angles && (() => {
                              const angles = parseJsonbArray(topic.content_angles)
                              return angles.length > 0 ? (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Tartalomszögek</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                      {angles.map((angle: string, idx: number) => (
                                        <span key={idx} className="text-xs text-gray-700 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                          {angle}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            })()}

                            {/* Ajánlott Csatornák */}
                            {topic.recommended_channels && (() => {
                              const channels = parseJsonbArray(topic.recommended_channels)
                              return channels.length > 0 ? (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Ajánlott Csatornák</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                      {channels.map((channel: string, idx: number) => (
                                        <span key={idx} className="text-xs text-gray-700 bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                          {channel}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            })()}

                            {/* Kapcsolódó Cél Típusok */}
                            {topic.related_goal_types && (() => {
                              const goalTypes = parseJsonbArray(topic.related_goal_types)
                              return goalTypes.length > 0 ? (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Kapcsolódó Cél Típusok</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                      {goalTypes.map((goalType: string, idx: number) => (
                                        <span key={idx} className="text-xs text-gray-700 bg-green-100 text-green-700 px-2 py-1 rounded">
                                          {goalType}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            })()}

                            {/* Kockázati Megjegyzések */}
                            {topic.risk_notes && (() => {
                              const risks = parseJsonbArray(topic.risk_notes)
                              return risks.length > 0 ? (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-700">Kockázati Megjegyzések</h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                      {risks.map((risk: string, idx: number) => (
                                        <span key={idx} className="text-xs text-gray-700 bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                          {risk}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            })()}
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

