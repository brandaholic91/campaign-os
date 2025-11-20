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

type Topic = Database['public']['Tables']['topics']['Row']
type TopicInsert = Database['public']['Tables']['topics']['Insert']

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Témák</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Mégse' : 'Új téma'}
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
            <Label htmlFor="category">Kategória</Label>
            <Input
              id="category"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Frissítés' : 'Létrehozás'}</Button>
            <Button type="button" onClick={handleCancel} className="border border-input bg-background hover:bg-accent">
              Mégse
            </Button>
          </div>
        </form>
      )}

      {topics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Még nincsenek témák</p>
          <p className="text-sm mt-2">Kattints az "Új téma" gombra a hozzáadáshoz</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Név</TableHead>
              <TableHead>Leírás</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="font-medium">{topic.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {topic.description || '-'}
                </TableCell>
                <TableCell>{topic.category || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      className="hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleEdit(topic)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className="hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleDelete(topic.id)}
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

