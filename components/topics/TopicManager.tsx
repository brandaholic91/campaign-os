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

type Topic = Database['campaign_os']['Tables']['topics']['Row']
type TopicInsert = Database['campaign_os']['Tables']['topics']['Insert']

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
  const [showForm, setShowForm] = useState(false)

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
      const payload = {
        ...formData,
        campaign_id: campaignId,
        description: formData.description || null,
        category: formData.category || null,
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
      setFormData({ name: '', description: '', category: '' })
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
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', category: '' })
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
              {topics.map((topic) => (
                <tr key={topic.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-4 align-top">
                    <span className="font-display font-bold text-gray-900 text-sm leading-snug block">
                      {topic.name}
                    </span>
                  </td>
                  <td className="py-6 px-4 align-top">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {topic.description || '-'}
                    </p>
                  </td>
                  <td className="py-6 px-4 align-top">
                    {topic.category ? (
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {topic.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-6 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

