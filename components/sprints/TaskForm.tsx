'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  campaign_id: string
  sprint_id?: string | null
  channel_id?: string | null
  title: string
  description?: string | null
  category?: string | null
  status?: 'todo' | 'in_progress' | 'done'
  assignee?: string | null
  due_date?: string | null
  created_at?: string
  updated_at?: string
}

type Channel = {
  id: string
  name: string
  type?: string
  created_at?: string
  updated_at?: string
}

interface TaskFormProps {
  campaignId: string
  sprintId: string
  channels: Channel[]
  initialData?: Task
  onSuccess: () => void
  onCancel: () => void
}

export default function TaskForm({
  campaignId,
  sprintId,
  channels,
  initialData,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'coordination',
    channel_id: initialData?.channel_id || 'none',
    due_date: initialData?.due_date || '',
    status: initialData?.status || 'todo',
    assignee: initialData?.assignee || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = '/api/tasks'
      const method = initialData ? 'PUT' : 'POST'
      const body = {
        ...formData,
        channel_id: formData.channel_id === 'none' ? null : formData.channel_id,
        campaign_id: campaignId,
        sprint_id: sprintId,
        id: initialData?.id,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save task')
      }

      router.refresh()
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the task.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !confirm('Are you sure you want to delete this task?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/tasks?id=${initialData.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete task')
      }

      router.refresh()
      onSuccess()
    } catch (err) {
      setError('Failed to delete task')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="What needs to be done?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Details about the task..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="copy">Copywriting</SelectItem>
              <SelectItem value="social_setup">Social Setup</SelectItem>
              <SelectItem value="ads_setup">Ads Setup</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="coordination">Coordination</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel">Channel (Optional)</Label>
          <Select
            value={formData.channel_id || 'none'}
            onValueChange={(value) =>
              setFormData({ ...formData, channel_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignee">Assignee</Label>
        <Input
          id="assignee"
          value={formData.assignee}
          onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
          placeholder="Who is responsible?"
        />
      </div>

      <div className="flex justify-between pt-4">
        {initialData ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        ) : (
          <div></div>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </div>
    </form>
  )
}
